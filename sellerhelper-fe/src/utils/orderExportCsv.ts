import type { OrderListItem } from '@/services/order.service';
import { getOrderExportLabel } from '@/constants/orderExportFields';

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatOrderDateRaw(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

export function getOrderFieldString(o: OrderListItem, key: string): string {
  switch (key) {
    case 'uid':
      return String(o.uid);
    case 'storeUid':
      return String(o.storeUid);
    case 'storeName':
      return o.storeName ?? '';
    case 'mallOrderNo':
      return o.mallOrderNo ?? '';
    case 'orderDate':
      return formatOrderDateRaw(o.orderDate);
    case 'orderStatus':
      return o.orderStatus ?? '';
    case 'totalAmount':
      return o.totalAmount != null ? String(o.totalAmount) : '';
    case 'buyerName':
      return o.buyerName ?? '';
    case 'buyerPhone':
      return o.buyerPhone ?? '';
    case 'receiverName':
      return o.receiverName ?? '';
    case 'receiverAddress':
      return o.receiverAddress ?? '';
    case 'itemCount':
      return o.itemCount != null ? String(o.itemCount) : '';
    default:
      return '';
  }
}

/** UTF-8 BOM 포함 CSV 문자열 (엑셀 한글 호환) */
export function buildOrderExportCsv(
  rows: OrderListItem[],
  columnKeys: string[],
  includeHeader = true
): string {
  const lines: string[] = [];
  if (includeHeader) {
    const header = columnKeys.map((k) => escapeCsvCell(getOrderExportLabel(k))).join(',');
    lines.push(header);
  }
  for (const row of rows) {
    const cells = columnKeys.map((k) => escapeCsvCell(getOrderFieldString(row, k)));
    lines.push(cells.join(','));
  }
  return '\uFEFF' + lines.join('\r\n');
}

export function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
