-- 플랫폼(Mall) 초기 데이터
-- JPA ddl-auto: update 후 테이블이 생성된 상태에서 실행
-- MallInitializer가 없거나 수동으로 초기 데이터를 넣을 때 사용

INSERT INTO malls (code, name, channel, description, api_base_url, enabled, sort_order, created_at, created_by, updated_at, updated_by)
SELECT 'COUPANG', '쿠팡', '쿠팡', NULL, NULL, true, 1, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM malls WHERE code = 'COUPANG');

INSERT INTO malls (code, name, channel, description, api_base_url, enabled, sort_order, created_at, created_by, updated_at, updated_by)
SELECT 'NAVER', '네이버 스마트스토어', '네이버', NULL, NULL, true, 2, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM malls WHERE code = 'NAVER');

INSERT INTO malls (code, name, channel, description, api_base_url, enabled, sort_order, created_at, created_by, updated_at, updated_by)
SELECT '11ST', '11번가', '11번가', NULL, NULL, true, 3, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM malls WHERE code = '11ST');

INSERT INTO malls (code, name, channel, description, api_base_url, enabled, sort_order, created_at, created_by, updated_at, updated_by)
SELECT 'GMARKET', '지마켓', '이베이코리아', NULL, NULL, true, 4, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM malls WHERE code = 'GMARKET');

INSERT INTO malls (code, name, channel, description, api_base_url, enabled, sort_order, created_at, created_by, updated_at, updated_by)
SELECT 'AUCTION', '옥션', '이베이코리아', NULL, NULL, false, 5, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM malls WHERE code = 'AUCTION');
