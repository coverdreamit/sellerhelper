/** 발주서 템플릿 필드 */
export interface TemplateField {
  fieldId?: number;
  fieldKey: string;
  fieldLabel: string;
  enabled?: boolean;
  required: boolean;
  order: number;
}

/** 발주서 템플릿 */
export interface OrderTemplate {
  templateId: number;
  vendorId: number;
  templateName: string;
  isDefault: boolean;
  fields?: TemplateField[];
  createdAt?: string;
}
