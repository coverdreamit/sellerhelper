/**
 * API 없이 개발 시 mock 데이터로 모든 스토어 초기화
 * 앱 진입점(Layout, _app 등)에서 한 번 호출하거나, 개발 시에만 사용
 *
 * 사용 예:
 *   import { initStoresWithMock } from '@/stores/initMock';
 *   initStoresWithMock();
 */
import { useStoreStore } from './storeStore';
import { useUserStoreStore } from './userStoreStore';
import { useVendorStore } from './vendorStore';
import { useOrderTemplateStore } from './orderTemplateStore';
import type { Vendor } from '@/types';
import { storesMock } from '@/mocks/stores';
import { userStoresMock } from '@/mocks/userStores';
import { vendorsMock } from '@/mocks/vendors';
import { buildOrderTemplatesWithFields } from '@/mocks/orderTemplates';

function toUserStoreItem(us) {
  return {
    storeCode: us.storeCode,
    isEnabled: us.isEnabled,
    authStatus: us.authStatus,
    lastSyncAt: us.lastSyncAt ?? undefined,
  };
}

export function initStoresWithMock() {
  useStoreStore.getState().setStores(storesMock.stores);
  useUserStoreStore.getState().setUserStores(userStoresMock.userStores.map(toUserStoreItem));
  useVendorStore.getState().setVendors(vendorsMock.vendors as Vendor[]);
  useOrderTemplateStore.getState().setTemplates(buildOrderTemplatesWithFields());
}
