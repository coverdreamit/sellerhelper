'use client';

import { useUserStoreStore } from '@/stores';

export function StoreCard({ store, onOpenAuth, onOpenSetting }) {
  const { toggleEnable } = useUserStoreStore();
  const userStore = store.userStore;

  const authStatus = userStore?.authStatus ?? 'DISCONNECTED';
  const isEnabled = userStore?.isEnabled ?? false;

  return (
    <div className={`store-card ${!store.isActive ? 'store-card--disabled' : ''}`}>
      <div className="store-card-header">
        <h3>{store.storeName}</h3>
        {!store.isActive && <span className="badge status-disconnected">준비중</span>}
        {store.isActive && (
          <span className={`badge status-${authStatus.toLowerCase()}`}>
            {authStatus}
          </span>
        )}
      </div>

      <div className="store-card-body">
        <p className="store-meta">
          마지막 동기화:{' '}
          {userStore?.lastSyncAt
            ? new Date(userStore.lastSyncAt).toLocaleString('ko-KR')
            : '-'}
        </p>

        <label className="toggle-row">
          <span>사용 여부</span>
          <input
            type="checkbox"
            checked={isEnabled}
            disabled={authStatus !== 'CONNECTED'}
            onChange={(e) => toggleEnable(store.storeCode, e.target.checked)}
          />
        </label>
      </div>

      <div className="store-card-actions">
        {store.isActive && (
          <>
            <button type="button" className="btn" onClick={onOpenAuth}>
              API 설정
            </button>
            <button type="button" className="btn" onClick={onOpenSetting}>
              기본 설정
            </button>
          </>
        )}
      </div>
    </div>
  );
}
