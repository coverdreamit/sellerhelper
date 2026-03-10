/**
 * 발주업체 서비스 (mock / API 교체 지점)
 */
const USE_MOCK = true;

import { vendorsMock } from '@/mocks/vendors';
import { getApiBase } from '@/lib/api';

export async function fetchVendors() {
  if (USE_MOCK) {
    return Promise.resolve(vendorsMock.vendors);
  }
  const res = await fetch(`${getApiBase()}/api/vendors`);
  if (!res.ok) throw new Error('Failed to fetch vendors');
  const data = await res.json();
  return data.vendors ?? data;
}
