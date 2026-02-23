-- 초기 권한 데이터 (애플리케이션 최초 실행 후 수동 실행 또는 Flyway 등으로 적용)
-- roles 테이블이 생성된 후 실행

INSERT INTO roles (code, name, description, sort_order, created_at, created_by, updated_at, updated_by)
VALUES
    ('ADMIN', '관리자', '시스템 전체 관리 권한', 1, NOW(), 'system', NOW(), 'system'),
    ('SELLER', '셀러', '판매 관련 기능', 2, NOW(), 'system', NOW(), 'system'),
    ('ORDER', '주문담당', '주문 처리 담당', 3, NOW(), 'system', NOW(), 'system')
ON CONFLICT (code) DO NOTHING;
