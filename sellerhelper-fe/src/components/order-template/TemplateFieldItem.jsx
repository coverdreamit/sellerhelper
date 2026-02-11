'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOrderTemplateStore } from '@/stores';

/**
 * 발주서 필드 한 줄. 드래그 핸들 + 체크박스(활성) + 라벨 + 필수 뱃지
 */
export function TemplateFieldItem({ field }) {
  const { updateFields, selectedTemplate } = useOrderTemplateStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.fieldKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleEnabled = () => {
    if (!selectedTemplate) return;
    const next = selectedTemplate.fields.map((f) =>
      f.fieldKey === field.fieldKey ? { ...f, enabled: !f.enabled } : f
    );
    useOrderTemplateStore.getState().updateFields(next);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px solid #e0e0e0',
        borderRadius: 6,
        padding: '10px 12px',
        marginBottom: 8,
        background: '#fff',
        ...style,
      }}
    >
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: '#888', userSelect: 'none' }}
        title="드래그하여 순서 변경"
      >
        ⋮⋮
      </span>
      <input
        type="checkbox"
        checked={field.enabled}
        onChange={toggleEnabled}
      />
      <span style={{ flex: 1 }}>{field.fieldLabel}</span>
      {field.required && (
        <span style={{ fontSize: '0.8rem', color: '#c00' }}>필수</span>
      )}
    </div>
  );
}
