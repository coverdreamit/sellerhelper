'use client';
import Link from '@/components/Link';
import { useParams } from 'next/navigation';
import '../../styles/Settings.css';

const mockOrder = {
  id: 'ORD-2024-001',
  store: '스마트스토어',
  status: '출고대기',
  orderDate: '2024-02-06 14:32',
  buyer: '홍길동',
  phone: '010-****-5678',
  address: '서울시 강남구 테헤란로 123',
  payMethod: '카드',
  amount: 45000,
  deliveryFee: 3000,
  total: 48000,
  items: [{ name: '무선 이어폰 블랙', option: '블랙', qty: 1, price: 45000 }],
};

export default function OrderDetail() {
  const { id } = useParams();

  return (
    <div className="list-page settings-page">
      <h1>주문 상세</h1>
      <p className="page-desc">주문번호: {id || mockOrder.id}</p>
      <section className="settings-section">
        <h2>주문 정보</h2>
        <div className="settings-form">
          <div className="form-row">
            <label>주문번호</label>
            <div>{mockOrder.id}</div>
          </div>
          <div className="form-row">
            <label>스토어</label>
            <div>{mockOrder.store}</div>
          </div>
          <div className="form-row">
            <label>주문상태</label>
            <div>
              <span className="badge badge-active">{mockOrder.status}</span>
            </div>
          </div>
          <div className="form-row">
            <label>주문일시</label>
            <div>{mockOrder.orderDate}</div>
          </div>
        </div>
      </section>
      <section className="settings-section">
        <h2>주문 상품</h2>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>옵션</th>
                <th>수량</th>
                <th>판매가</th>
              </tr>
            </thead>
            <tbody>
              {mockOrder.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.option}</td>
                  <td>{item.qty}</td>
                  <td>₩{item.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <span>상품금액 ₩{mockOrder.amount.toLocaleString()}</span>
          <span style={{ marginLeft: 16 }}>배송비 ₩{mockOrder.deliveryFee.toLocaleString()}</span>
          <strong style={{ marginLeft: 16 }}>합계 ₩{mockOrder.total.toLocaleString()}</strong>
        </div>
      </section>
      <section className="settings-section">
        <h2>배송지 정보</h2>
        <div className="settings-form">
          <div className="form-row">
            <label>수령인</label>
            <div>{mockOrder.buyer}</div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>{mockOrder.phone}</div>
          </div>
          <div className="form-row">
            <label>주소</label>
            <div>{mockOrder.address}</div>
          </div>
        </div>
      </section>
      <div className="settings-actions">
        <button type="button" className="btn btn-primary">
          주문 확인
        </button>
        <Link to="/shipping/invoice" className="btn">
          송장 입력
        </Link>
        <Link to="/order/claim" className="btn">
          취소/반품/교환
        </Link>
        <Link to="/order/list" className="btn">
          목록
        </Link>
      </div>
    </div>
  );
}
