import { Suspense } from 'react';
import VendorOrderContentPage from '@/views/settings/supplier/VendorOrderContentPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="settings-page supplier-form-page" style={{ padding: 24 }}>
          불러오는 중…
        </div>
      }
    >
      <VendorOrderContentPage />
    </Suspense>
  );
}
