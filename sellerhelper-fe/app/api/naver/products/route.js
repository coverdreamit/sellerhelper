/**
 * 네이버 스마트스토어 상품 목록 API
 * - 토큰 발급 후 주문 API에서 productId 추출 → 채널상품 API로 상세 조회
 * - TODO: 백엔드 연동 시 이 하드코딩 제거
 */

import { NextResponse } from 'next/server';
import axios from 'axios';
import bcrypt from 'bcryptjs';

// 하드코딩 - TODO: 백엔드 연동 시 제거
const NAVER_CLIENT_ID = '4O8bptcqiuUf9T9VG23vqm';
const NAVER_CLIENT_SECRET = '$2a$04$zL9RgpD8VVdUMYX4/IApIO';
const BASE_URL = 'https://api.commerce.naver.com/external';

// 주문 API에서 상품이 없을 때 사용할 기본 상품 번호 (get-product.js 예시)
const DEFAULT_PRODUCT_NOS = ['13067770763', '13058723016'];

function getClientSecretSign() {
  const timestamp = Date.now().toString();
  const password = `${NAVER_CLIENT_ID}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, NAVER_CLIENT_SECRET);
  return {
    client_secret_sign: Buffer.from(hashed, 'utf-8').toString('base64'),
    timestamp,
  };
}

async function getToken() {
  const { client_secret_sign, timestamp } = getClientSecretSign();
  const res = await axios.post(
    `${BASE_URL}/v1/oauth2/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: NAVER_CLIENT_ID,
      client_secret_sign,
      timestamp,
      type: 'SELF',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

async function getChannelProduct(token, channelProductNo) {
  const url = `${BASE_URL}/v2/products/channel-products/${channelProductNo}`;
  const res = await axios.get(url, {
    headers: {
      Accept: 'application/json;charset=UTF-8',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

async function getGroupProduct(token, groupProductNo) {
  const url = `${BASE_URL}/v2/standard-group-products/${groupProductNo}`;
  const res = await axios.get(url, {
    headers: {
      Accept: 'application/json;charset=UTF-8',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

const saleStatusMap = {
  SALE: '판매중',
  OUTOFSTOCK: '품절',
  UNADMISSION: '승인대기',
  REJECTION: '승인거절',
  SUSPENSION: '판매중지',
  CLOSE: '판매종료',
};

function parseChannelProduct(data, channelProductNo) {
  const op = data?.originProduct ?? {};
  const ch = data?.smartstoreChannelProduct ?? {};
  const displayStatusMap = { ON: '전시중', SUSPENSION: '전시중지', WAIT: '전시대기' };
  return {
    id: channelProductNo,
    productNo: channelProductNo,
    name: op.name ?? '-',
    price: op.salePrice != null ? Number(op.salePrice) : 0,
    stock: op.stockQuantity ?? 0,
    status: saleStatusMap[op.statusType] ?? op.statusType ?? '-',
    displayStatus: displayStatusMap[ch.channelProductDisplayStatusType] ?? ch.channelProductDisplayStatusType ?? '-',
    imageUrl: op.images?.representativeImage?.url ?? null,
    store: '스마트스토어',
    updated: new Date().toISOString().slice(0, 10),
  };
}

function parseGroupProduct(data, groupProductNo) {
  const gp = data?.groupProduct ?? {};
  const spList = data?.specificProducts ?? [];
  const firstSp = spList[0];
  return {
    id: String(groupProductNo),
    productNo: String(groupProductNo),
    name: gp.name ?? firstSp?.productName ?? '-',
    price: firstSp?.salePrice != null ? Number(firstSp.salePrice) : 0,
    stock: spList.reduce((sum, sp) => sum + (sp.stockQuantity ?? 0), 0),
    status: saleStatusMap[firstSp?.statusType] ?? firstSp?.statusType ?? '-',
    displayStatus: '-',
    imageUrl: firstSp?.images?.representativeImage?.url ?? null,
    store: '스마트스토어',
    updated: new Date().toISOString().slice(0, 10),
  };
}

/** 주문 API에서 productId(채널상품번호) 추출 */
function extractProductIdsFromOrders(data) {
  const ids = new Set();
  const list = Array.isArray(data?.data) ? data.data : [];
  const visit = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    const pid = obj.productId ?? obj.productid;
    if (pid && String(pid).trim()) ids.add(String(pid).trim());
    if (obj.productOrder) visit(obj.productOrder);
    if (Array.isArray(obj.productOrders)) obj.productOrders.forEach(visit);
    else if (obj.order) visit(obj.order);
  };
  for (const item of list) {
    visit(item);
  }
  return [...ids];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productNosParam = searchParams.get('productNos');
    let productNos = productNosParam
      ? productNosParam.split(',').map((s) => s.trim()).filter(Boolean)
      : null;

    if (!productNos?.length) {
      const token = await getToken();
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const lastChangedFrom = fromDate.toISOString();
      try {
        const orderRes = await axios.get(
          `${BASE_URL}/v1/pay-order/seller/product-orders/last-changed-statuses`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { lastChangedFrom, limitCount: 100 },
          }
        );
        productNos = extractProductIdsFromOrders(orderRes.data);
      } catch (orderErr) {
        // 주문 API 실패 시 기본 번호 사용
        productNos = [...DEFAULT_PRODUCT_NOS];
      }
      if (!productNos.length) productNos = [...DEFAULT_PRODUCT_NOS];
    }

    const token = await getToken();
    const results = [];
    const seen = new Set();

    for (const no of productNos) {
      if (seen.has(no)) continue;
      seen.add(no);
      try {
        const data = await getChannelProduct(token, no);
        results.push(parseChannelProduct(data, no));
      } catch (err) {
        if (err.response?.status === 404) continue;
        try {
          const data = await getGroupProduct(token, no);
          results.push(parseGroupProduct(data, no));
        } catch (gErr) {
          if (gErr.response?.status !== 404) {
            console.error(`상품 ${no} 조회 실패:`, err.response?.data || err.message);
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error('네이버 상품 API 오류:', err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message || '상품 조회에 실패했습니다.' },
      { status: err.response?.status ?? 500 }
    );
  }
}
