'use client';

import { useState } from 'react';
import { autoMapColumns, getMergedSystemColumns } from '@/utils/autoMapping';
import '@/styles/Settings.css';

export default function OrderTemplateUploadModal({ onClose, onSave, supplierId: initialSupplierId = '1' }) {
  const [step, setStep] = useState(1);
  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [excelColumns, setExcelColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const systemColumns = getMergedSystemColumns();

  /** 데모용 가짜 업로드: 자동매핑 적용 후 항상 2단계로 이동해 육안 확인 가능 */
  const handleFakeUpload = () => {
    const fakeExcelCols = ['발주번호', '상품명', '옵션명', '수량', '단가', '비고사항'];
    const nextMapping = autoMapColumns(fakeExcelCols);
    setExcelColumns(fakeExcelCols);
    setMapping(nextMapping);
    setStep(2);
  };

  const handleChangeMapping = (excelCol, value) => {
    setMapping((prev) => ({
      ...prev,
      [excelCol]: { ...prev[excelCol], key: value },
    }));
  };

  const hasUnmapped = Object.values(mapping).some((m) => !m.key);

  const handleSave = () => {
    const columnKeys = Object.values(mapping)
      .map((m) => m.key)
      .filter(Boolean);
    onSave?.(supplierId, columnKeys);
    onClose?.();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>발주양식 업로드</h2>
        <p className="modal-desc">엑셀 파일을 업로드하면 컬럼이 자동 매핑됩니다. (데모에서는 가짜 데이터 사용)</p>

        {step === 1 && (
          <>
            <div className="form-row">
              <label>발주업체</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="1">(주)공급업체A</option>
                <option value="2">B도매센터</option>
              </select>
            </div>
            <div className="form-row">
              <label>엑셀 파일</label>
              <div>
                <button type="button" className="btn btn-primary" onClick={handleFakeUpload}>
                  엑셀 업로드 (데모)
                </button>
                <p className="form-hint">※ 데모에서는 실제 파일을 사용하지 않습니다.</p>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ marginTop: 12, fontSize: '1rem' }}>컬럼 매핑</h3>
            <p className="form-hint">엑셀 컬럼을 시스템 컬럼에 맞춰주세요. 미매핑인 항목은 저장할 수 없습니다.</p>
            <div className="settings-table-wrap" style={{ marginTop: 12 }}>
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>엑셀 컬럼</th>
                    <th>시스템 컬럼</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {excelColumns.map((col) => {
                    const m = mapping[col];
                    return (
                      <tr key={col}>
                        <td>{col}</td>
                        <td>
                          <select
                            value={m?.key ?? ''}
                            onChange={(e) => handleChangeMapping(col, e.target.value)}
                            style={{ padding: '6px 10px', minWidth: 140 }}
                          >
                            <option value="">선택 안 함</option>
                            {systemColumns.map((sc) => (
                              <option key={sc.key} value={sc.key}>
                                {sc.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {m?.confidence === 'high' && (
                            <span className="badge badge-active">자동</span>
                          )}
                          {m?.confidence === 'medium' && (
                            <span className="badge badge-warning">확인필요</span>
                          )}
                          {m?.confidence === 'none' && (
                            <span className="badge badge-inactive">미매핑</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="settings-actions modal-actions">
          {step === 2 && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={hasUnmapped}
              onClick={handleSave}
            >
              저장
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
