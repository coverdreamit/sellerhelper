/**
 * 시스템 지원 스토어 (운영자/시스템 관리)
 * @typedef {Object} Store
 * @property {string} storeCode - NAVER, COUPANG ...
 * @property {string} storeName
 * @property {('OPEN_MARKET'|'SOCIAL'|'ETC')} storeType
 * @property {boolean} apiRequired
 * @property {boolean} isActive
 * @property {string} [description]
 */

/** @type {'OPEN_MARKET'|'SOCIAL'|'ETC'} */
export const StoreType = { OPEN_MARKET: 'OPEN_MARKET', SOCIAL: 'SOCIAL', ETC: 'ETC' };
