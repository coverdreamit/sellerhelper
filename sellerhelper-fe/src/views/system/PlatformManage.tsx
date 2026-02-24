'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
  fetchMalls,
  fetchMall,
  deleteMall,
  reorderMalls,
  type MallItem,
} from '@/services';
import MallFormModal from './platform/MallFormModal';
import '@/styles/Settings.css';
import '../settings/store/StoreList.css';

function SortableMallRow({
  mall,
  onEdit,
  onDelete,
}: {
  mall: MallItem;
  onEdit: (uid: number) => void;
  onDelete: (mall: MallItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(mall.uid),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      <td><code>{mall.code}</code></td>
      <td>{mall.name}</td>
      <td>{mall.channel || '-'}</td>
      <td style={{ fontSize: 12, color: '#6b7280' }}>{mall.apiBaseUrl || '-'}</td>
      <td>
        <span className={`badge badge-${mall.enabled ? 'active' : 'inactive'}`}>
          {mall.enabled ? '사용' : '미사용'}
        </span>
      </td>
      <td className="cell-actions">
        <button type="button" className="btn-link" onClick={() => onEdit(mall.uid)}>
          수정
        </button>
        <button type="button" className="btn-link text-danger" onClick={() => onDelete(mall)}>
          삭제
        </button>
      </td>
    </tr>
  );
}

/** 운영자용: 플랫폼(Mall) 코드 관리
 * 쿠팡, 네이버, 11번가 등 쇼핑몰 종류를 DB에 등록
 * 셀러는 환경설정 > 스토어 연동에서 등록된 플랫폼 중 선택해 API 연동
 */
export default function PlatformManage() {
  const [malls, setMalls] = useState<MallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formMall, setFormMall] = useState<MallItem | null | 'add'>(null);
  const [reordering, setReordering] = useState(false);

  const loadMalls = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchMalls();
      setMalls(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '플랫폼 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMalls();
  }, [loadMalls]);

  const handleDelete = async (mall: MallItem) => {
    if (!window.confirm(`"${mall.name}" 플랫폼을 삭제하시겠습니까? 연동된 스토어가 있으면 삭제할 수 없을 수 있습니다.`)) return;
    setError('');
    try {
      await deleteMall(mall.uid);
      await loadMalls();
    } catch (e) {
      setError(e instanceof Error ? e.message : '플랫폼 삭제 실패');
    }
  };

  const handleEdit = async (uid: number) => {
    setError('');
    try {
      const mall = await fetchMall(uid);
      setFormMall(mall);
    } catch (e) {
      setError(e instanceof Error ? e.message : '플랫폼 조회 실패');
    }
  };

  const filtered = malls.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = malls.findIndex((m) => String(m.uid) === String(active.id));
      const newIdx = malls.findIndex((m) => String(m.uid) === String(over.id));
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(malls, oldIdx, newIdx);
      setMalls(reordered);
      setReordering(true);
      setError('');
      try {
        await reorderMalls(reordered.map((m) => m.uid));
      } catch (e) {
        setError(e instanceof Error ? e.message : '순서 변경 실패');
        await loadMalls();
      } finally {
        setReordering(false);
      }
    },
    [malls, loadMalls]
  );

  if (loading && malls.length === 0) {
    return (
      <div className="settings-page">
        <h1>플랫폼 관리</h1>
        <p className="page-desc">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>플랫폼 관리</h1>
      <p className="page-desc">
        쇼핑몰 플랫폼(쿠팡, 스마트스토어, 카카오쇼핑 등)을 DB에 등록합니다. 등록된 플랫폼만 셀러가 환경설정 &gt; 스토어 연동에서 선택해 API를 연동할 수 있습니다.
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <section className="settings-section">
        <div className="settings-toolbar">
          <p className="store-list-hint">드래그하여 순서를 변경할 수 있습니다.</p>
          <div>
            <input
              type="text"
              placeholder="플랫폼명/코드 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormMall('add')}
            disabled={reordering}
          >
            플랫폼 추가
          </button>
        </div>
        <div className="settings-table-wrap">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="settings-table">
              <thead>
                <tr>
                  <th className="store-drag-cell" aria-label="순서 변경" />
                  <th>플랫폼 코드</th>
                  <th>플랫폼명</th>
                  <th>채널</th>
                  <th>API 베이스 URL</th>
                  <th>사용 여부</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                      {malls.length === 0
                        ? '등록된 플랫폼이 없습니다. 플랫폼 추가 버튼을 클릭하세요.'
                        : '검색 결과가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={filtered.map((m) => String(m.uid))}
                    strategy={verticalListSortingStrategy}
                  >
                    {filtered.map((mall) => (
                      <SortableMallRow
                        key={mall.uid}
                        mall={mall}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </section>

      {(formMall === 'add' || formMall) && (
        <MallFormModal
          mall={formMall === 'add' ? null : formMall}
          onClose={() => setFormMall(null)}
          onSaved={loadMalls}
        />
      )}
    </div>
  );
}
