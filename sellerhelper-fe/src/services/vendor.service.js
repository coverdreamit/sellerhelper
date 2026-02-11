/**
 * 발주업체 서비스 (mock / API 교체 지점)
 */
const USE_MOCK = true;

import { vendorsMock } from '@/mocks/vendors';

export async function fetchVendors() {
  if (USE_MOCK) {
    return Promise.resolve(vendorsMock.vendors);
  }
  const res = await fetch('/api/vendors');
  if (!res.ok) throw new Error('Failed to fetch vendors');
  const data = await res.json();
  return data.vendors ?? data;
}
