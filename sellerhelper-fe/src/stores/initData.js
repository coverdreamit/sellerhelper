/**
 * 앱 진입 시 데이터 로드 (mock / API 동일 진입점)
 * Layout에서 useEffect로 한 번 호출
 */
import { useStoreStore } from './storeStore';
import { useUserStoreStore } from './userStoreStore';
import { useVendorStore } from './vendorStore';
import { useOrderTemplateStore } from './orderTemplateStore';

export async function initAppData() {
  await Promise.all([
    useStoreStore.getState().loadStores(),
    useUserStoreStore.getState().loadUserStores(),
    useVendorStore.getState().loadVendors(),
    useOrderTemplateStore.getState().loadTemplates(),
  ]);
}
