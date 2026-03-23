import { apiFetch } from '@/lib/api';

export interface VendorOrderLineDto {
  orderUid: number;
  mallOrderNo: string;
  orderDate?: string | null;
  orderStatus?: string | null;
  orderTotalAmount?: number | string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  receiverAddress?: string | null;
  orderItemUid: number;
  mallItemId?: string | null;
  productName?: string | null;
  optionInfo?: string | null;
  quantity?: number | null;
  productOrderStatus?: string | null;
  channelType?: string | null;
  externalProductId?: string | null;
  externalOptionId?: string | null;
  sellerSku?: string | null;
}

export interface VendorOrderLinesPage {
  content: VendorOrderLineDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchVendorOrderLines(
  storeUid: number,
  vendorUid: number,
  page = 0,
  size = 50
): Promise<VendorOrderLinesPage> {
  const q = new URLSearchParams({
    vendorUid: String(vendorUid),
    page: String(page),
    size: String(size),
  });
  const res = await apiFetch(`/api/my-stores/${storeUid}/orders/vendor-lines?${q.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주업체별 주문 라인 조회 실패');
  }
  const data = await res.json();
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    content,
    page: Number(data.page ?? 0),
    size: Number(data.size ?? size),
    totalElements: Number(data.totalElements ?? content.length),
    totalPages: Number(data.totalPages ?? 0),
    first: Boolean(data.first),
    last: Boolean(data.last),
  };
}
