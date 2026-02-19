'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStoreStore, useUserStoreStore } from '@/stores';
import StoreAuthModal from '@/components/store/StoreAuthModal';
import StoreSettingModal from '@/components/store/StoreSettingModal';
import StoreAddModal from '@/components/store/StoreAddModal';
import '@/styles/Settings.css';
import './StoreList.css';

function SortableStoreRow({ store, onDisconnect, onAuth, onSetting, onToggleEnable }) {
  const userStore = store.userStore;
  const authStatus = userStore?.authStatus ?? 'DISCONNECTED';
  const isEnabled = userStore?.isEnabled ?? false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: store.storeCode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'store-row-dragging' : ''}>
      <td className="store-drag-cell">
        <span
          className="store-drag-handle"
          {...attributes}
          {...listeners}
          title="드래그하여 순서 변경"
        >
          ⋮⋮
        </span>
      </td>
      <td>
        {store.storeName}
        {!store.isActive && (
          <span className="badge badge-inactive" style={{ marginLeft: 8 }}>
            준비중
          </span>
        )}
      </td>
      <td>
        <span className={`badge status-${authStatus.toLowerCase()}`}>{authStatus}</span>
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
            onChange={(e) => onToggleEnable(store.storeCode, e.target.checked)}
          />
          <span>{isEnabled ? '사용' : '미사용'}</span>
        </label>
      </td>
      <td className="cell-actions">
        {store.isActive && (
          <>
            <button type="button" className="btn" onClick={() => onAuth(store.storeCode)}>
              API 설정
            </button>
            <button type="button" className="btn" onClick={() => onSetting(store.storeCode)}>
              기본 설정
            </button>
            {userStore && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDisconnect(store.storeCode, store.storeName)}
              >
                연동 해제
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}

export default function StoreList() {
  const { stores, loading, error, addStore, reorderStores } = useStoreStore();
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

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderStores(String(active.id), String(over.id));
      }
    },
    [reorderStores]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (loading) return <p className="settings-page">로딩 중...</p>;
  if (error) return <p className="settings-page">오류: {error}</p>;

  return (
    <div className="settings-page">
      <h1>스토어 연동</h1>
      <p className="page-desc">연동된 쇼핑몰 스토어를 조회·관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <p className="store-list-hint">드래그(⋮⋮)로 순서 변경 · 상품 목록 탭 순서에 반영됩니다</p>
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
                <th className="store-drag-cell"></th>
                <th>스토어명</th>
                <th>연동 상태</th>
                <th>마지막 동기화</th>
                <th>사용 여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <tbody>
                <SortableContext
                  items={storeConnections.map((s) => s.storeCode)}
                  strategy={verticalListSortingStrategy}
                >
                  {storeConnections.map((store) => (
                    <SortableStoreRow
                      key={store.storeCode}
                      store={store}
                      onDisconnect={handleDisconnect}
                      onAuth={setAuthStoreCode}
                      onSetting={setSettingStoreCode}
                      onToggleEnable={toggleEnable}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </DndContext>
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
