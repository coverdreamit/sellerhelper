import {
  DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS,
  migrateColumnKeys,
} from '@/constants/orderTemplateFields';

const STORAGE_KEY_PREFIX = 'supplierForm_';

export function loadSupplierPoColumnKeys(supplierId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + supplierId);
    if (!raw) return [...DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS];
    const data = JSON.parse(raw);
    if (Array.isArray(data.columnKeys) && data.columnKeys.length) {
      return migrateColumnKeys(data.columnKeys);
    }
    if (Array.isArray(data.nodes) && data.nodes.length) {
      const sorted = [...data.nodes].sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));
      const keys = sorted.map((n) => n.data?.key).filter(Boolean);
      return migrateColumnKeys(keys);
    }
  } catch (_) {}
  return [...DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS];
}

export function saveSupplierPoColumnKeys(supplierId: string, columnKeys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + supplierId, JSON.stringify({ columnKeys }));
  } catch (_) {}
}
