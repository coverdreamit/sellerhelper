'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from '@/components/Link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  confirmOrder,
  dispatchOrder,
  fetchOrderDetail,
  type OrderDetail as OrderDetailModel,
} from '@/services/order.service';
import '../../styles/Settings.css';

export default function OrderDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const storeUid = Number(searchParams.get('storeUid') ?? 0);
  const orderUid = Number(id ?? 0);
  const [order, setOrder] = useState<OrderDetailModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryCompany, setDeliveryCompany] = useState('CJGLS');
  const [trackingNumber, setTrackingNumber] = useState('');

  const hasValidParams = useMemo(
    () => Number.isFinite(storeUid) && storeUid > 0 && Number.isFinite(orderUid) && orderUid > 0,
    [storeUid, orderUid]
  );

  async function loadDetail() {
    if (!hasValidParams) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderDetail(storeUid, orderUid);
      setOrder(data);
    } catch (e) {
      setOrder(null);
      setError(e instanceof Error ? e.message : '주문 상세 조회 실패');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [hasValidParams, storeUid, orderUid]);

  async function handleConfirm() {
    if (!hasValidParams) return;
    setProcessing(true);
    setError(null);
    try {
      await confirmOrder(storeUid, orderUid);
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주 확인 처리 실패');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDispatch() {
    if (!hasValidParams) return;
    if (!deliveryCompany.trim() || !trackingNumber.trim()) {
      setError('택배사 코드와 송장번호를 입력하세요.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      await dispatchOrder(storeUid, orderUid, {
        deliveryCompany: deliveryCompany.trim(),
        trackingNumber: trackingNumber.trim(),
      });
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : '발송 처리 실패');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="list-page settings-page">
      <h1>주문 상세</h1>
      <p className="page-desc">
        주문 ID: {id ?? '-'} / 스토어: {storeUid || '-'}
      </p>
      <section className="settings-section">
        {!hasValidParams ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#666' }}>
            잘못된 접근입니다. 주문 목록에서 다시 선택해 주세요.
          </p>
        ) : loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#666' }}>조회 중...</p>
        ) : !order ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#666' }}>
            주문 상세를 불러오지 못했습니다.
          </p>
        ) : (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <tbody>
                <tr>
                  <th>주문번호</th>
                  <td>{order.mallOrderNo || '-'}</td>
                  <th>상태</th>
                  <td>{order.orderStatus || '-'}</td>
                </tr>
                <tr>
                  <th>주문자</th>
                  <td>{order.buyerName || '-'}</td>
                  <th>연락처</th>
                  <td>{order.buyerPhone || '-'}</td>
                </tr>
                <tr>
                  <th>수령인</th>
                  <td>{order.receiverName || '-'}</td>
                  <th>수령인 연락처</th>
                  <td>{order.receiverPhone || '-'}</td>
                </tr>
                <tr>
                  <th>주소</th>
                  <td colSpan={3}>{order.receiverAddress || '-'}</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: 16 }}>상품주문</h3>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>상품주문번호</th>
                  <th>상품명</th>
                  <th>옵션</th>
                  <th>수량</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
                      상품주문 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item) => (
                    <tr key={item.uid}>
                      <td>{item.mallItemId || '-'}</td>
                      <td>{item.productName || '-'}</td>
                      <td>{item.optionInfo || '-'}</td>
                      <td>{item.quantity ?? '-'}</td>
                      <td>{item.productOrderStatus || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {error && <p style={{ color: '#c00', marginTop: 8 }}>{error}</p>}
      {hasValidParams && (
        <section className="settings-section" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>네이버 주문 처리</h3>
          <div className="settings-actions" style={{ marginBottom: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={processing || loading}
            >
              {processing ? '처리 중...' : '발주 확인'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              placeholder="택배사 코드 (예: CJGLS)"
              style={{ minWidth: 180 }}
            />
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="송장번호"
              style={{ minWidth: 240 }}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDispatch}
              disabled={processing || loading}
            >
              {processing ? '처리 중...' : '발송 처리'}
            </button>
          </div>
        </section>
      )}
      <div className="settings-actions">
        <Link to={`/order/list${storeUid ? `?storeUid=${storeUid}` : ''}`} className="btn">
          목록
        </Link>
      </div>
    </div>
  );
}
