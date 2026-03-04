-- 회사(Company) 초기 데이터
-- 스토어 등록 시 소속 회사 선택용
-- JPA ddl-auto: update 후 테이블이 생성된 상태에서 실행

INSERT INTO companies (name, business_number, address, phone, email, ceo_name, sort_order, created_at, created_by, updated_at, updated_by)
SELECT '테스트회사', '000-00-00000', NULL, NULL, NULL, NULL, 1, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM companies LIMIT 1);
