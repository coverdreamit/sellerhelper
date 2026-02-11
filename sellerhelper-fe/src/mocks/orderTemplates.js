/**
 * 발주서 템플릿 mock (ORDER_TEMPLATE + ORDER_TEMPLATE_FIELD)
 */
export const orderTemplatesMock = {
  orderTemplates: [
    {
      templateId: 10001,
      vendorId: 501,
      templateName: 'ABC 기본 발주서',
      isDefault: true,
      createdAt: '2026-02-01T10:00:00',
    },
    {
      templateId: 10002,
      vendorId: 501,
      templateName: '전자제품 전용 발주서',
      isDefault: false,
      createdAt: '2026-02-05T09:00:00',
    },
  ],
};

export const templateFieldsMock = {
  templateFields: [
    { fieldId: 1, templateId: 10001, fieldKey: 'productName', fieldLabel: '상품명', required: true, order: 1 },
    { fieldId: 2, templateId: 10001, fieldKey: 'optionName', fieldLabel: '옵션', required: false, order: 2 },
    { fieldId: 3, templateId: 10001, fieldKey: 'quantity', fieldLabel: '수량', required: true, order: 3 },
    { fieldId: 4, templateId: 10001, fieldKey: 'receiverAddress', fieldLabel: '배송지', required: true, order: 4 },
  ],
};

/**
 * 템플릿 + 필드 합쳐서 에디터/미리보기용으로 쓰기 좋은 형태
 */
export function buildOrderTemplatesWithFields() {
  const { orderTemplates } = orderTemplatesMock;
  const { templateFields } = templateFieldsMock;
  return orderTemplates.map((t) => ({
    ...t,
    fields: templateFields
      .filter((f) => f.templateId === t.templateId)
      .map((f) => ({
        fieldKey: f.fieldKey,
        fieldLabel: f.fieldLabel,
        enabled: true,
        required: f.required,
        order: f.order,
      }))
      .sort((a, b) => a.order - b.order),
  }));
}
