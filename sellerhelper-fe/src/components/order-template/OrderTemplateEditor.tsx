'use client';

import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useOrderTemplateStore } from '@/stores';
import { TemplateFieldItem } from './TemplateFieldItem';

export function OrderTemplateEditor() {
  const { selectedTemplate, updateFields } = useOrderTemplateStore();

  if (!selectedTemplate?.fields?.length) return null;

  const fields = [...selectedTemplate.fields].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.fieldKey === active.id);
    const newIndex = fields.findIndex((f) => f.fieldKey === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(fields, oldIndex, newIndex).map((f, idx) => ({
      ...f,
      order: idx + 1,
    }));
    updateFields(reordered);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.fieldKey)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {fields.map((field) => (
            <TemplateFieldItem key={field.fieldKey} field={field} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
