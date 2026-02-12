/**
 * 상품 서비스 - 네이버 스마트스토어 API 연동 + 기타 스토어 데모 데이터
 * TODO: 백엔드 연동 시 /api/naver/products 호출 제거, 데모 데이터 제거
 */

import { productDemoMock } from '@/mocks/productDemo';

export async function fetchProducts(productNos = null) {
  let naverProducts = [];
  try {
    const params = productNos?.length
      ? new URLSearchParams({ productNos: productNos.join(',') })
      : '';
    const url = `/api/naver/products${params ? `?${params}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      naverProducts = await res.json();
    }
  } catch (e) {
    // API 실패 시 네이버 상품 없이 데모만 표시
  }
  return [...(Array.isArray(naverProducts) ? naverProducts : []), ...productDemoMock];
}
