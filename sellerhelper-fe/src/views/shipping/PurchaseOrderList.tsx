'use client';

import { useEffect, useState } from 'react';
import {
  deletePurchaseOrderHistory,
  listPurchaseOrderHistory,
  updatePurchaseOrderHistory,
  type PurchaseOrderHistoryItem,
} from '@/services/purchaseOrderHistory.service';
import { downloadBlob, exportPurchaseOrderExcel } from '@/services/purchaseOrder.service';
import { useVendorStore } from '@/stores';
import '../../styles/Settings.css';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatStampForFilename(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export default function PurchaseOrderList() {
  const { vendors, loadVendors } = useVendorStore();
  const [items, setItems] = useState<PurchaseOrderHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editVendorId, setEditVendorId] = useState<number | ''>('');

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  async function reload() {
    try {
      setError(null);
      setItems(await listPurchaseOrderHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주서 목록 조회 실패');
      setItems([]);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const hasItems = items.length > 0;

  async function handleReprint(item: PurchaseOrderHistoryItem) {
    setBusyId(item.uid);
    setError(null);
    try {
      const blob = await exportPurchaseOrderExcel(item.storeUid, {
        vendorId: item.vendorId,
        orderUids: item.orderUids,
        columnKeys: item.columnKeys,
      });
      const safeName = (item.name || '발주서').replace(/[\\/:*?"<>|]/g, '_');
      downloadBlob(blob, `${safeName}_${formatStampForFilename(new Date())}.xlsx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주서 재출력에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(item: PurchaseOrderHistoryItem) {
    setEditId(item.uid);
    setEditName(item.name);
    setEditMemo(item.memo ?? '');
    setEditVendorId(item.vendorId);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName('');
    setEditMemo('');
    setEditVendorId('');
  }

  async function handleSaveEdit(item: PurchaseOrderHistoryItem) {
    const name = editName.trim();
    if (!name) {
      setError('발주서명을 입력하세요.');
      return;
    }
    const nextVendorId = editVendorId === '' ? item.vendorId : Number(editVendorId);
    try {
      setError(null);
      await updatePurchaseOrderHistory(item.uid, {
        name,
        memo: editMemo.trim(),
        vendorId: nextVendorId,
        orderUids: item.orderUids,
        columnKeys: item.columnKeys,
      });
      cancelEdit();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주서 수정에 실패했습니다.');
    }
  }

  async function handleDelete(item: PurchaseOrderHistoryItem) {
    const ok = window.confirm(`"${item.name}" 발주서를 목록에서 삭제할까요?`);
    if (!ok) return;
    try {
      setError(null);
      await deletePurchaseOrderHistory(item.uid);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주서 삭제에 실패했습니다.');
    }
  }

  return (
    <div className="list-page">
      <h1>발주서 목록</h1>
      <p className="page-desc">
        배송 목록에서 생성한 발주서를 저장·관리합니다. 저장된 발주서는 이름/메모/발주업체를 수정할 수 있고, 나중에 같은 조건으로 다시
        출력할 수 있습니다.
      </p>

      <section className="settings-section">
        {error && <p style={{ color: '#c00', margin: '0 0 12px' }}>{error}</p>}
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>발주서명</th>
                <th>스토어</th>
                <th>발주업체</th>
                <th>주문 수</th>
                <th>저장일시</th>
                <th>메모</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {!hasItems ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                    저장된 발주서가 없습니다. 배송 목록에서 발주서를 생성하면 이 목록에 자동 저장됩니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEdit = editId === item.uid;
                  return (
                    <tr key={item.uid}>
                      <td>
                        {isEdit ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: '100%', minWidth: 180 }}
                            aria-label="발주서명"
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td>{item.storeName}</td>
                      <td>
                        {isEdit ? (
                          <select
                            value={editVendorId === '' ? '' : String(editVendorId)}
                            onChange={(e) => setEditVendorId(e.target.value === '' ? '' : Number(e.target.value))}
                            aria-label="발주업체 선택"
                          >
                            <option value="">현재 값 유지</option>
                            {vendors.map((v) => (
                              <option key={v.vendorId} value={String(v.vendorId)}>
                                {v.vendorName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.vendorName
                        )}
                      </td>
                      <td>{item.orderUids.length.toLocaleString()}건</td>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>
                        {isEdit ? (
                          <input
                            type="text"
                            value={editMemo}
                            onChange={(e) => setEditMemo(e.target.value)}
                            style={{ width: '100%', minWidth: 180 }}
                            aria-label="메모"
                          />
                        ) : (
                          item.memo || '-'
                        )}
                      </td>
                      <td className="cell-actions">
                        {isEdit ? (
                          <>
                            <button type="button" className="btn btn-primary" onClick={() => handleSaveEdit(item)}>
                              저장
                            </button>
                            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handleReprint(item)}
                              disabled={busyId === item.uid}
                            >
                              {busyId === item.uid ? '출력 중…' : '다시 출력'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => startEdit(item)}>
                              편집
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => handleDelete(item)}>
                              삭제
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
