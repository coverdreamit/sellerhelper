'use client';

import { useState } from 'react';
import { useStoreStore, useUserStoreStore } from '@/stores';
import StoreAuthModal from '@/components/store/StoreAuthModal';
import StoreSettingModal from '@/components/store/StoreSettingModal';
import StoreAddModal from '@/components/store/StoreAddModal';
import '@/styles/Settings.css';

export default function StoreList() {
  const { stores, loading, error, addStore } = useStoreStore();
  const { userStores, toggleEnable, disconnectStore, connectStore } = useUserStoreStore();

  const [authStoreCode, setAuthStoreCode] = useState(null);
  const [settingStoreCode, setSettingStoreCode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const storeConnections = stores.map((store) => {
    const userStore = userStores.find((us) => us.storeCode === store.storeCode);
    return { ...store, userStore: userStore ?? null };
  });

  /** 데모용: 스토어 추가 후 바로 연동된 걸로 표시 (나중에 제거) */
  const handleAdd = (store) => {
    addStore(store);
    connectStore(store.storeCode);
    setShowAddModal(false);
  };

  const handleDisconnect = (storeCode, storeName) => {
    if (window.confirm(`"${storeName}" 연동을 해제하시겠습니까?`)) {
      disconnectStore(storeCode);
    }
  };

  if (loading) return <p className="settings-page">로딩 중...</p>;
  if (error) return <p className="settings-page">오류: {error}</p>;

  return (
    <div className="settings-page">
      <h1>스토어 관리</h1>
      <p className="page-desc">연동된 쇼핑몰 스토어를 조회·관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            스토어 추가
          </button>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>스토어명</th>
                <th>연동 상태</th>
                <th>마지막 동기화</th>
                <th>사용 여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {storeConnections.map((store) => {
                const userStore = store.userStore;
                const authStatus = userStore?.authStatus ?? 'DISCONNECTED';
                const isEnabled = userStore?.isEnabled ?? false;
                return (
                  <tr key={store.storeCode}>
                    <td>
                      {store.storeName}
                      {!store.isActive && (
                        <span className="badge badge-inactive" style={{ marginLeft: 8 }}>
                          준비중
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge status-${authStatus.toLowerCase()}`}>
                        {authStatus}
                      </span>
                    </td>
                    <td>
                      {userStore?.lastSyncAt
                        ? new Date(userStore.lastSyncAt).toLocaleString('ko-KR')
                        : '-'}
                    </td>
                    <td>
                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          disabled={authStatus !== 'CONNECTED'}
                          onChange={(e) =>
                            toggleEnable(store.storeCode, e.target.checked)
                          }
                        />
                        <span>{isEnabled ? '사용' : '미사용'}</span>
                      </label>
                    </td>
                    <td className="cell-actions">
                      {store.isActive && (
                        <>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => setAuthStoreCode(store.storeCode)}
                          >
                            API 설정
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => setSettingStoreCode(store.storeCode)}
                          >
                            기본 설정
                          </button>
                          {userStore && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() =>
                                handleDisconnect(store.storeCode, store.storeName)
                              }
                            >
                              연동 해제
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <StoreAuthModal
        storeCode={authStoreCode}
        onClose={() => setAuthStoreCode(null)}
      />

      <StoreSettingModal
        storeCode={settingStoreCode}
        onClose={() => setSettingStoreCode(null)}
      />

      {showAddModal && (
        <StoreAddModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
