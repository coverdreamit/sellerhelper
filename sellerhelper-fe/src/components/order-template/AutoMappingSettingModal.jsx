'use client';

import { useState, useEffect } from 'react';
import {
  getCustomExactMap,
  setCustomExactMap,
  getCustomSystemColumns,
  setCustomSystemColumns,
  DEFAULT_SYSTEM_COLUMNS,
  DEFAULT_MAPPING_RULES,
} from '@/utils/autoMapping';
import '@/styles/Settings.css';

export default function AutoMappingSettingModal({ onClose }) {
  const [systemColumns, setSystemColumns] = useState([]); // [{ key, label }, ...] 사용자 추가분만
  const [rules, setRules] = useState([]); // [{ excelCol, systemKey }, ...]

  useEffect(() => {
    setSystemColumns(getCustomSystemColumns());
    const storedRules = getCustomExactMap();
    setRules(
      Object.entries(storedRules).map(([excelCol, systemKey]) => ({ excelCol: excelCol || '', systemKey: systemKey || '' }))
    );
  }, []);

  const addDefaultSystemColumns = () => {
    const existingKeys = new Set(systemColumns.map((c) => (c.key || '').trim()).filter(Boolean));
    const toAdd = DEFAULT_SYSTEM_COLUMNS.filter((c) => !existingKeys.has(c.key));
    if (toAdd.length) setSystemColumns((prev) => [...prev, ...toAdd]);
  };

  const addDefaultRules = () => {
    const existingCols = new Set(rules.map((r) => (r.excelCol || '').trim()).filter(Boolean));
    const toAdd = Object.entries(DEFAULT_MAPPING_RULES).filter(([excelCol]) => !existingCols.has(excelCol));
    if (toAdd.length) setRules((prev) => [...prev, ...toAdd.map(([excelCol, systemKey]) => ({ excelCol, systemKey }))]);
  };

  const mergedColumns = systemColumns.filter((c) => (c.key || '').trim() && (c.label || '').trim());

  const addSystemColumn = () => {
    setSystemColumns((prev) => [...prev, { key: '', label: '' }]);
  };

  const updateSystemColumn = (index, field, value) => {
    setSystemColumns((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeSystemColumn = (index) => {
    setSystemColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    setRules((prev) => [...prev, { excelCol: '', systemKey: '' }]);
  };

  const updateRule = (index, field, value) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const colsToSave = systemColumns
      .map((c) => ({ key: (c.key || '').trim(), label: (c.label || '').trim() }))
      .filter((c) => c.key && c.label);
    setCustomSystemColumns(colsToSave);

    const exact = {};
    rules.forEach((r) => {
      const col = (r.excelCol || '').trim();
      if (col && r.systemKey) exact[col] = r.systemKey;
    });
    setCustomExactMap(exact);
    onClose?.();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>자동매핑 설정</h2>
        <p className="modal-desc">
          여기서 정한 시스템 컬럼과 매핑 규칙이 발주양식 업로드 시 자동 매핑에 사용됩니다. 수정·추가한 뒤 저장하면 됩니다.
        </p>

        <h3 style={{ margin: '16px 0 8px', fontSize: '1rem' }}>시스템 컬럼 (사용자 추가)</h3>
        <p className="form-hint" style={{ marginBottom: 8 }}>
          매핑 규칙에서 선택할 시스템 컬럼을 등록하세요. 키는 영문으로 입력하세요.
        </p>
        <div className="settings-table-wrap" style={{ marginBottom: 8 }}>
          <table className="settings-table">
            <thead>
              <tr>
                <th>키 (영문)</th>
                <th>표시명</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {systemColumns.map((c, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={c.key}
                      onChange={(e) => updateSystemColumn(i, 'key', e.target.value)}
                      placeholder="예: option2"
                      style={{ width: '100%', padding: '6px 10px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => updateSystemColumn(i, 'label', e.target.value)}
                      placeholder="예: 옵션2"
                      style={{ width: '100%', padding: '6px 10px' }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => removeSystemColumn(i)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={addSystemColumn}>
            + 시스템 컬럼 추가
          </button>
          <button type="button" className="btn" onClick={addDefaultSystemColumns}>
            기본 칼럼 추가
          </button>
        </div>

        <h3 style={{ margin: '16px 0 8px', fontSize: '1rem' }}>매핑 규칙 (엑셀 컬럼 → 시스템 컬럼)</h3>
        <p className="form-hint" style={{ marginBottom: 8 }}>
          엑셀에 나오는 컬럼명과 시스템 컬럼을 연결해 두면, 업로드 시 같은 이름이 있을 때 자동으로 매핑됩니다.
        </p>
        <div className="settings-table-wrap" style={{ marginBottom: 12 }}>
          <table className="settings-table">
            <thead>
              <tr>
                <th>엑셀 컬럼명</th>
                <th>시스템 컬럼</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={r.excelCol}
                      onChange={(e) => updateRule(i, 'excelCol', e.target.value)}
                      placeholder="예: 비고사항"
                      style={{ width: '100%', padding: '6px 10px' }}
                    />
                  </td>
                  <td>
                    <select
                      value={r.systemKey}
                      onChange={(e) => updateRule(i, 'systemKey', e.target.value)}
                      style={{ padding: '6px 10px', minWidth: 140 }}
                    >
                      <option value="">선택</option>
                      {mergedColumns.map((sc) => (
                        <option key={sc.key} value={sc.key}>
                          {sc.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => removeRule(i)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={addRule}>
            + 규칙 추가
          </button>
          <button type="button" className="btn" onClick={addDefaultRules}>
            기본 규칙 추가
          </button>
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
