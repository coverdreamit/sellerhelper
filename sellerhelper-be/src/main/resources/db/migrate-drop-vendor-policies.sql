-- 발주정책(VendorPolicy) 엔티티 제거 후 기존 DB에서 테이블 삭제
-- 애플리케이션 배포(엔티티 삭제) 전후에 한 번 실행하면 됩니다.

DROP TABLE IF EXISTS vendor_policies CASCADE;
