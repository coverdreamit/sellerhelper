'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ORDER_TEMPLATE_FIELDS,
  DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS,
  getOrderTemplateFieldMap,
} from '@/constants/orderTemplateFields';
import '@/styles/Settings.css';

function SortableColumnItem({ id, label, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`form-sortable-item ${isDragging ? 'form-sortable-item-dragging' : ''}`}
    >
      <span
        className="form-sortable-handle"
        {...attributes}
        {...listeners}
        title="드래그하여 순서 변경"
      >
        ⋮⋮
      </span>
      <span className="form-sortable-label">{label}</span>
      <button
        type="button"
        className="form-sortable-remove"
        onClick={() => onRemove(id)}
        title="삭제"
      >
        ×
      </button>
    </div>
  );
}

export default function OrderTemplateEditModal({
  supplierId,
  supplierName,
  initialColumnKeys,
  onClose,
  onSave,
}) {
  const [selectedColumns, setSelectedColumns] = useState(
    initialColumnKeys?.length ? initialColumnKeys : DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS
  );

  const columnMap = useMemo(() => getOrderTemplateFieldMap(), []);

  useEffect(() => {
    setSelectedColumns(initialColumnKeys?.length ? initialColumnKeys : DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS);
  }, [supplierId, initialColumnKeys]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedColumns((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const addColumn = useCallback((key) => {
    setSelectedColumns((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const removeColumn = useCallback((key) => {
    setSelectedColumns((prev) => prev.filter((k) => k !== key));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(supplierId, selectedColumns);
    onClose?.();
  }, [supplierId, selectedColumns, onSave, onClose]);

  if (!supplierId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg modal-xl" onClick={(e) => e.stopPropagation()}>
        <h2>발주 양식 컬럼 설정 - {supplierName ?? '발주업체'}</h2>
        <p className="modal-desc">
          스마트스토어 주문·배송 DB와 동일한 항목입니다. 왼쪽에서 추가하고 오른쪽에서 드래그해 순서를
          맞춘 뒤 저장하면 배송 목록 발주서에 반영됩니다.
        </p>

        <div className="form-column-layout form-column-layout--modal">
          <div className="form-column-sidebar">
            <h3>추가할 항목</h3>
            <p className="form-hint">클릭하면 오른쪽 목록에 추가됩니다.</p>
            <ul className="form-column-add-list">
              {ORDER_TEMPLATE_FIELDS.map((col) => (
                <li key={col.key}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => addColumn(col.key)}
                    disabled={selectedColumns.includes(col.key)}
                  >
                    + {col.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="form-column-sortable-wrap">
            <h3>포함 항목 (순서대로 엑셀에 반영)</h3>
            <p className="form-hint">드래그(⋮⋮)로 순서 변경, ×로 삭제</p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={selectedColumns} strategy={verticalListSortingStrategy}>
                <div className="form-sortable-list">
                  {selectedColumns.map((key) => {
                    const col = columnMap[key];
                    if (!col) return null;
                    return (
                      <SortableColumnItem
                        key={key}
                        id={key}
                        label={col.label}
                        onRemove={removeColumn}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="settings-actions modal-actions">
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            저장
          </button>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
