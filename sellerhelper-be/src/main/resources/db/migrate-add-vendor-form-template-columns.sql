-- 발주업체별 발주양식 파일 저장용 컬럼 추가
-- Vendor 엔티티의 formTemplate* 필드 반영

ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS form_template_file BYTEA,
    ADD COLUMN IF NOT EXISTS form_template_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS form_template_content_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS form_template_uploaded_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS form_template_mapping_json TEXT;
