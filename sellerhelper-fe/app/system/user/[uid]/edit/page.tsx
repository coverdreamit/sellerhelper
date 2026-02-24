'use client';

import { useParams } from 'next/navigation';
import UserEdit from '@/views/system/user/UserEdit';

export default function UserEditPage() {
  const params = useParams();
  const uid = Number(params.uid);
  if (Number.isNaN(uid)) {
    return (
      <div className="settings-page">
        <p style={{ color: '#dc2626' }}>잘못된 사용자 ID입니다.</p>
      </div>
    );
  }
  return <UserEdit uid={uid} />;
}
