'use client';

import '@/styles/Settings.css';

export function OrderTemplateList({ templates, selectedTemplate, onSelect }) {
  if (!templates?.length) {
    return <p style={{ color: '#666' }}>등록된 발주서 템플릿이 없습니다.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {templates.map((t) => (
        <li key={t.templateId} style={{ marginBottom: 8 }}>
          <button
            type="button"
            className="btn"
            style={{
              width: '100%',
              textAlign: 'left',
              background: selectedTemplate?.templateId === t.templateId ? '#e3f2fd' : undefined,
            }}
            onClick={() => onSelect(t)}
          >
            {t.templateName}
            {t.isDefault && (
              <span className="badge badge-active" style={{ marginLeft: 8 }}>기본</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
