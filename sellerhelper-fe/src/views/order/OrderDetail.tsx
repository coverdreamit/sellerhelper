'use client';
import Link from '@/components/Link';
import { useParams } from 'next/navigation';
import '../../styles/Settings.css';

export default function OrderDetail() {
  const { id } = useParams();

  return (
    <div className="list-page settings-page">
      <h1>주문 상세</h1>
      <p className="page-desc">주문 ID: {id ?? '-'}</p>
      <section className="settings-section">
        <p style={{ padding: 24, textAlign: 'center', color: '#666' }}>
          주문 상세 API 연동 후 데이터가 표시됩니다. 주문 목록에서 항목을 선택해 주세요.
        </p>
      </section>
      <div className="settings-actions">
        <Link to="/order/list" className="btn">
          목록
        </Link>
      </div>
    </div>
  );
}
