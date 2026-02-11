'use client';

import { useOrderTemplateStore } from '@/stores';

export function OrderTemplatePreview() {
  const { selectedTemplate } = useOrderTemplateStore();

  if (!selectedTemplate) return null;

  const fields = (selectedTemplate.fields || [])
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order);

  if (!fields.length) {
    return (
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          padding: 16,
          background: '#f8f9fa',
          color: '#666',
        }}
      >
        활성화된 필드가 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
        background: '#f8f9fa',
      }}
    >
      {fields.map((field) => (
        <div key={field.fieldKey} style={{ marginBottom: 12 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>{field.fieldLabel}</strong>
          <span style={{ color: '#888' }}>_______________</span>
        </div>
      ))}
    </div>
  );
}
