-- store_products를 API raw payload 중심 구조로 전환
-- 실행 전 백업 권장

ALTER TABLE store_products
    ADD COLUMN IF NOT EXISTS raw_payload TEXT NULL;

ALTER TABLE store_products
    DROP COLUMN IF EXISTS product_name,
    DROP COLUMN IF EXISTS option_name,
    DROP COLUMN IF EXISTS sale_price,
    DROP COLUMN IF EXISTS original_price,
    DROP COLUMN IF EXISTS stock_quantity,
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS category_id;
