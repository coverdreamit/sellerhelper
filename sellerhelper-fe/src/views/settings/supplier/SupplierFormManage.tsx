'use client';
import { useRef, useState } from 'react';
import Link from '@/components/Link';
import { useVendorStore } from '@/stores';
import {
  downloadVendorFormTemplate,
  fetchVendorFormTemplateMappings,
  fetchVendorFormTemplatePreview,
  type VendorFormTemplatePreview,
  type VendorFormTemplateMappingItem,
  saveVendorFormTemplateMappings,
  uploadVendorFormTemplate,
} from '@/services';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toISOString().slice(0, 10);
}

const SYSTEM_COLUMNS = [
  { key: 'orderNo', label: '발주번호', required: false },
  { key: 'orderDate', label: '발주일', required: false },
  { key: 'productCode', label: '상품코드', required: true },
  { key: 'productName', label: '상품명', required: false },
  { key: 'option', label: '옵션', required: false },
  { key: 'qty', label: '수량', required: true },
  { key: 'unitPrice', label: '단가', required: false },
  { key: 'supplyPrice', label: '공급가', required: false },
  { key: 'amount', label: '금액', required: false },
  { key: 'deliveryRequest', label: '납기요청일', required: false },
  { key: 'remark', label: '비고', required: false },
];

export default function SupplierFormManage() {
  const { vendors, setVendors } = useVendorStore();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [previewVendorName, setPreviewVendorName] = useState('');
  const [previewVendorId, setPreviewVendorId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<VendorFormTemplatePreview | null>(null);
  const [mappingByHeader, setMappingByHeader] = useState<Record<string, string>>({});

  const openFilePicker = (vendorId: number) => {
    fileInputRefs.current[vendorId]?.click();
  };

  const handleUpload = async (vendorId: number, file?: File) => {
    if (!file) return;
    try {
      const updated = await uploadVendorFormTemplate(vendorId, file);
      setVendors(vendors.map((vendor) => (vendor.vendorId === vendorId ? updated : vendor)));
      alert('발주 양식 파일이 저장되었습니다.');
      const preview = await fetchVendorFormTemplatePreview(vendorId);
      const savedMappings = await fetchVendorFormTemplateMappings(vendorId);
      const nextMapping = Object.fromEntries(savedMappings.map((m) => [m.excelHeader, m.systemKey]));
      const vendorName = vendors.find((v) => v.vendorId === vendorId)?.vendorName ?? '발주업체';
      setPreviewVendorId(vendorId);
      setPreviewVendorName(vendorName);
      setPreviewData(preview);
      setMappingByHeader(nextMapping);
    } catch (e) {
      const message = e instanceof Error ? e.message : '발주 양식 업로드에 실패했습니다.';
      alert(message);
    }
  };

  const handlePreview = async (vendorId: number) => {
    try {
      const preview = await fetchVendorFormTemplatePreview(vendorId);
      const savedMappings = await fetchVendorFormTemplateMappings(vendorId);
      const nextMapping = Object.fromEntries(savedMappings.map((m) => [m.excelHeader, m.systemKey]));
      const vendorName = vendors.find((v) => v.vendorId === vendorId)?.vendorName ?? '발주업체';
      setPreviewVendorId(vendorId);
      setPreviewVendorName(vendorName);
      setPreviewData(preview);
      setMappingByHeader(nextMapping);
    } catch (e) {
      const message = e instanceof Error ? e.message : '발주 그리드 미리보기에 실패했습니다.';
      alert(message);
    }
  };

  const setHeaderMapping = (excelHeader: string, systemKey: string) => {
    setMappingByHeader((prev) => {
      const next = { ...prev };
      if (!systemKey) {
        next[excelHeader] = '';
        return next;
      }
      Object.keys(next).forEach((header) => {
        if (next[header] === systemKey) next[header] = '';
      });
      next[excelHeader] = systemKey;
      return next;
    });
  };

  const handleSaveMappings = async () => {
    if (!previewVendorId || !previewData) return;
    const mappedSystemKeys = new Set(Object.values(mappingByHeader).filter(Boolean));
    const missingRequired = SYSTEM_COLUMNS.filter((col) => col.required && !mappedSystemKeys.has(col.key));
    if (missingRequired.length > 0) {
      alert(`필수 컬럼 매핑이 누락되었습니다: ${missingRequired.map((c) => c.label).join(', ')}`);
      return;
    }
    try {
      const mappings: VendorFormTemplateMappingItem[] = previewData.headers
        .map((header) => ({
          excelHeader: header,
          systemKey: mappingByHeader[header] ?? '',
        }))
        .filter((m) => m.excelHeader && m.systemKey);
      await saveVendorFormTemplateMappings(previewVendorId, mappings);
      setVendors(
        vendors.map((vendor) =>
          vendor.vendorId === previewVendorId ? { ...vendor, formTemplateMappings: mappings } : vendor
        )
      );
      alert('발주 컬럼 매핑이 저장되었습니다.');
    } catch (e) {
      const message = e instanceof Error ? e.message : '발주 컬럼 매핑 저장에 실패했습니다.';
      alert(message);
    }
  };

  const handleDownload = async (vendorId: number) => {
    try {
      const { blob, fileName } = await downloadVendorFormTemplate(vendorId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : '발주 양식 다운로드에 실패했습니다.';
      alert(message);
    }
  };

  return (
    <div className="settings-page supplier-form-page">
      <h1>발주양식 관리</h1>
      <p className="page-desc">
        발주업체별로 엑셀 발주 양식 파일을 업로드하여 서버 DB에 저장합니다.
      </p>

      <section className="settings-section">
        <h2>발주양식 목록</h2>
        <div className="settings-toolbar">
          <div />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/settings/supplier/list" className="btn">
              발주업체 목록
            </Link>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>발주업체</th>
                <th>양식 파일명</th>
                <th>사용여부</th>
                <th>업로드일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.vendorId}>
                  <td>{vendor.vendorName}</td>
                  <td>{vendor.formTemplateFileName ?? '-'}</td>
                  <td>
                    <span className={`badge badge-${vendor.isActive ? 'active' : 'inactive'}`}>
                      {vendor.isActive ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td>{formatDate(vendor.formTemplateUploadedAt)}</td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openFilePicker(vendor.vendorId)}
                    >
                      {vendor.hasFormTemplateFile ? '양식 재업로드' : '양식 업로드'}
                    </button>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[vendor.vendorId] = el;
                      }}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        void handleUpload(vendor.vendorId, file);
                        e.target.value = '';
                      }}
                    />
                    {vendor.hasFormTemplateFile && (
                      <>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => {
                            void handlePreview(vendor.vendorId);
                          }}
                        >
                          그리드 보기
                        </button>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => {
                            void handleDownload(vendor.vendorId);
                          }}
                        >
                          다운로드
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>
                    등록된 발주업체가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {previewData && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setPreviewData(null);
            setPreviewVendorId(null);
            setMappingByHeader({});
          }}
        >
          <div className="modal modal-lg modal-xl" onClick={(e) => e.stopPropagation()}>
            <h2>발주 그리드 미리보기 - {previewVendorName}</h2>
            <p className="modal-desc">저장된 양식 파일의 첫 번째 시트를 기준으로 상위 20행까지 보여줍니다.</p>
            <div className="preview-table-wrap" style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <table className="preview-table">
                <thead>
                  <tr>
                    {previewData.headers.map((header, idx) => (
                      <th key={`${header}-${idx}`}>{header || `컬럼${idx + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.map((_, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`}>{row[colIndex] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: '1rem' }}>발주 칼럼 매핑 (체크)</h3>
            <p className="form-hint" style={{ marginBottom: 10 }}>
              행(엑셀 컬럼)마다 하나의 시스템 컬럼만 체크할 수 있습니다. 필수: 상품코드, 수량
            </p>
            <div className="settings-table-wrap" style={{ maxHeight: '34vh', overflow: 'auto' }}>
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>엑셀 컬럼</th>
                    <th>매핑 안 함</th>
                    {SYSTEM_COLUMNS.map((col) => (
                      <th key={col.key}>
                        {col.label}
                        {col.required ? ' *' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.headers.map((header, rowIdx) => (
                    <tr key={`${header}-${rowIdx}`}>
                      <td>{header || `컬럼${rowIdx + 1}`}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!mappingByHeader[header]}
                          onChange={() => setHeaderMapping(header, '')}
                        />
                      </td>
                      {SYSTEM_COLUMNS.map((col) => (
                        <td key={`${header}-${col.key}`}>
                          <input
                            type="checkbox"
                            checked={mappingByHeader[header] === col.key}
                            onChange={() => setHeaderMapping(header, col.key)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="settings-actions modal-actions">
              <button type="button" className="btn btn-primary" onClick={handleSaveMappings}>
                매핑 저장
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setPreviewData(null);
                  setPreviewVendorId(null);
                  setMappingByHeader({});
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
