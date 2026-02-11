/**
 * 발주서 템플릿 서비스 (mock / API 교체 지점)
 */
const USE_MOCK = true;

import { buildOrderTemplatesWithFields } from '@/mocks/orderTemplates';

export async function fetchOrderTemplates() {
  if (USE_MOCK) {
    return Promise.resolve(buildOrderTemplatesWithFields());
  }
  const res = await fetch('/api/order-templates');
  if (!res.ok) throw new Error('Failed to fetch order templates');
  const data = await res.json();
  return data.templates ?? data;
}

export async function saveOrderTemplate(template) {
  if (USE_MOCK) {
    return Promise.resolve(template);
  }
  const res = await fetch(`/api/order-templates/${template.templateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}
