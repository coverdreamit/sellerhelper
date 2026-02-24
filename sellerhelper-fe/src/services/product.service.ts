/**
 * 상품 서비스 - 백엔드 API 연동
 * TODO: 백엔드 /api/products 구현 시 연동
 */

import { apiFetch } from '@/lib/api';

export async function fetchProducts(productNos?: string[] | null): Promise<unknown[]> {
  try {
    const params = productNos?.length
      ? new URLSearchParams({ productNos: productNos.join(',') })
      : '';
    const url = `/api/products${params ? `?${params}` : ''}`;
    const res = await apiFetch(url);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('상품 목록 조회 실패');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.products ?? [];
  } catch {
    return [];
  }
}
