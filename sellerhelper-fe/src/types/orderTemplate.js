/**
 * 발주서 템플릿 필드
 * @typedef {Object} TemplateField
 * @property {number} [fieldId]
 * @property {string} fieldKey
 * @property {string} fieldLabel
 * @property {boolean} [enabled]
 * @property {boolean} required
 * @property {number} order
 */

/**
 * 발주서 템플릿
 * @typedef {Object} OrderTemplate
 * @property {number} templateId
 * @property {number} vendorId
 * @property {string} templateName
 * @property {boolean} isDefault
 * @property {TemplateField[]} [fields]
 * @property {string} [createdAt]
 */
