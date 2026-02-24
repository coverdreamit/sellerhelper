'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchMyStores,
  disconnectMyStore,
  reorderMyStores,
  type MyStoreItem,
} from '@/services';
import { useAuthStore, useMyStoreStore } from '@/stores';
import StoreConnectModal from '@/components/store/StoreConnectModal';
import StoreEditModal from '@/components/store/StoreEditModal';
import '@/styles/Settings.css';
import './StoreList.css';

function SortableStoreRow({
  store,
  disconnecting,
  onEdit,
  onDisconnect,
}: {
  store: MyStoreItem;
  disconnecting: number | null;
  onEdit: (store: MyStoreItem) => void;
  onDisconnect: (store: MyStoreItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(store.uid),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'store-row-dragging' : ''}
    >
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
      <td>{store.mallName}</td>
      <td>{store.name}</td>
      <td>
        <span className={`badge badge-${store.enabled ? 'active' : 'inactive'}`}>
          {store.enabled ? '사용' : '미사용'}
        </span>
      </td>
      <td>
        <span className={`badge badge-${store.hasAuth ? 'active' : 'inactive'}`}>
          {store.hasAuth ? '연동됨' : '미연동'}
        </span>
      </td>
      <td className="cell-actions">
        <button type="button" className="btn-link" onClick={() => onEdit(store)}>
          수정
        </button>
        <button
          type="button"
          className="btn-link text-danger"
          onClick={() => onDisconnect(store)}
          disabled={disconnecting === store.uid}
        >
          {disconnecting === store.uid ? '해제 중...' : '연동 해제'}
        </button>
      </td>
    </tr>
  );
}

export default function StoreList() {
  const { user } = useAuthStore();
  const canManagePlatform = user?.menuKeys?.includes('system-platform');
  const [stores, setStores] = useState<MyStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [editingStore, setEditingStore] = useState<MyStoreItem | null>(null);
  const [disconnecting, setDisconnecting] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchMyStores();
      setStores(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '스토어 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleDisconnect = async (store: MyStoreItem) => {
    if (!window.confirm(`"${store.name}" 연동을 해제하시겠습니까?`)) return;
    setDisconnecting(store.uid);
    setError('');
    try {
      await disconnectMyStore(store.uid);
      await loadStores();
    } catch (e) {
      setError(e instanceof Error ? e.message : '연동 해제 실패');
    } finally {
      setDisconnecting(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: { active: { id: string }; over: { id: string } | null }) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = stores.findIndex((s) => String(s.uid) === active.id);
      const newIndex = stores.findIndex((s) => String(s.uid) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(stores, oldIndex, newIndex);
      setStores(reordered);
      setReordering(true);
      setError('');
      try {
        await reorderMyStores(reordered.map((s) => s.uid));
        await useMyStoreStore.getState().loadMyStores();
      } catch (e) {
        setError(e instanceof Error ? e.message : '순서 변경 실패');
        await loadStores();
      } finally {
        setReordering(false);
      }
    },
    [stores, loadStores]
  );

  if (loading && stores.length === 0) {
    return (
      <div className="settings-page">
        <h1>스토어 관리</h1>
        <p className="page-desc">로딩 중...</p>
      </div>
    );
  }

  const storeIds = stores.map((s) => String(s.uid));

  return (
    <div className="settings-page">
      <h1>스토어 관리</h1>
      <p className="page-desc">
        사용 가능한 플랫폼을 선택해 스토어를 연동합니다. 순서를 드래그하여 변경하면 상품·주문·배송 목록의 탭 순서에 반영됩니다.
        {canManagePlatform ? (
          <>
            {' '}
            <Link href="/system/platform" className="link-inline">
              플랫폼 관리
            </Link>
            에서 플랫폼을 추가·수정할 수 있습니다.
          </>
        ) : (
          ' 플랫폼은 운영자가 등록합니다.'
        )}
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <section className="settings-section">
        <div className="settings-toolbar">
          <p className="store-list-hint">
            플랫폼 선택 후 API 키를 입력해 연동하세요. 드래그로 순서를 변경할 수 있습니다.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowConnectModal(true)}
            disabled={reordering}
          >
            스토어 연동 추가
          </button>
        </div>
        <div className="settings-table-wrap">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="settings-table">
              <thead>
                <tr>
                  <th className="store-drag-cell" aria-label="순서 변경" />
                  <th>플랫폼</th>
                  <th>스토어명</th>
                  <th>사용</th>
                  <th>연동 상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                      연동된 스토어가 없습니다. &quot;스토어 연동 추가&quot; 버튼을 클릭하세요.
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={storeIds} strategy={verticalListSortingStrategy}>
                    {stores.map((store) => (
                      <SortableStoreRow
                        key={store.uid}
                        store={store}
                        disconnecting={disconnecting}
                        onEdit={setEditingStore}
                        onDisconnect={handleDisconnect}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </section>

      {showConnectModal && (
        <StoreConnectModal
          onClose={() => setShowConnectModal(false)}
          onConnected={loadStores}
        />
      )}

      {editingStore && (
        <StoreEditModal
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onSaved={loadStores}
        />
      )}
    </div>
  );
}
