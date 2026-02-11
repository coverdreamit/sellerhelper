/**
 * 발주업체 (사용자 소유)
 * @typedef {Object} Vendor
 * @property {number} vendorId
 * @property {number} [userId]
 * @property {string} vendorName
 * @property {string} [managerName]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {('EMAIL'|'EXCEL'|'API'|'ETC')} orderMethod
 * @property {('DIRECT'|'CONSIGNMENT'|'MIXED')} shippingType
 * @property {boolean} isActive
 * @property {string} [memo]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/** @type {'EMAIL'|'EXCEL'|'API'|'ETC'} */
export const OrderMethod = { EMAIL: 'EMAIL', EXCEL: 'EXCEL', API: 'API', ETC: 'ETC' };

/** @type {'DIRECT'|'CONSIGNMENT'|'MIXED'} */
export const ShippingType = { DIRECT: 'DIRECT', CONSIGNMENT: 'CONSIGNMENT', MIXED: 'MIXED' };
