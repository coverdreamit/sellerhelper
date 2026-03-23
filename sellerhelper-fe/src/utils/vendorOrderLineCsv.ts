import type { VendorOrderLineDto } from '@/services/vendorOrderLines.service';
import { getPurchaseExportLabel } from '@/constants/purchaseOrderExportFields';

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ko-KR', {
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

export function getVendorLineFieldString(row: VendorOrderLineDto, key: string): string {
  switch (key) {
    case 'orderUid':
      return String(row.orderUid);
    case 'mallOrderNo':
      return row.mallOrderNo ?? '';
    case 'orderDate':
      return formatWhen(row.orderDate);
    case 'orderStatus':
      return row.orderStatus ?? '';
    case 'orderTotalAmount':
      if (row.orderTotalAmount == null || row.orderTotalAmount === '') return '';
      return String(row.orderTotalAmount);
    case 'buyerName':
      return row.buyerName ?? '';
    case 'buyerPhone':
      return row.buyerPhone ?? '';
    case 'receiverName':
      return row.receiverName ?? '';
    case 'receiverPhone':
      return row.receiverPhone ?? '';
    case 'receiverAddress':
      return row.receiverAddress ?? '';
    case 'orderItemUid':
      return String(row.orderItemUid);
    case 'mallItemId':
      return row.mallItemId ?? '';
    case 'productName':
      return row.productName ?? '';
    case 'optionInfo':
      return row.optionInfo ?? '';
    case 'quantity':
      return row.quantity != null ? String(row.quantity) : '';
    case 'productOrderStatus':
      return row.productOrderStatus ?? '';
    case 'channelType':
      return row.channelType ?? '';
    case 'externalProductId':
      return row.externalProductId ?? '';
    case 'externalOptionId':
      return row.externalOptionId ?? '';
    case 'sellerSku':
      return row.sellerSku ?? '';
    default:
      const raw = (row as unknown as Record<string, unknown>)[key];
      if (raw == null) return '';
      if (typeof raw === 'string') return raw;
      if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
      try {
        return JSON.stringify(raw);
      } catch {
        return String(raw);
      }
  }
}

export function buildVendorOrderLineCsv(
  rows: VendorOrderLineDto[],
  columnKeys: string[],
  includeHeader = true
): string {
  const lines: string[] = [];
  if (includeHeader) {
    const header = columnKeys.map((k) => escapeCsvCell(getPurchaseExportLabel(k))).join(',');
    lines.push(header);
  }
  for (const row of rows) {
    const cells = columnKeys.map((k) => escapeCsvCell(getVendorLineFieldString(row, k)));
    lines.push(cells.join(','));
  }
  return '\uFEFF' + lines.join('\r\n');
}

export { downloadCsvFile } from './orderExportCsv';
