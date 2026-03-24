import { apiFetch } from '@/lib/api';

export interface PurchaseOrderExportBody {
  vendorId: number;
  orderUids: number[];
  columnKeys: string[];
}

/** 발주서 엑셀(xlsx) 다운로드용 Blob */
export async function exportPurchaseOrderExcel(
  storeUid: number,
  body: PurchaseOrderExportBody
): Promise<Blob> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/purchase-orders/export`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || '발주서 생성에 실패했습니다.');
  }
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
