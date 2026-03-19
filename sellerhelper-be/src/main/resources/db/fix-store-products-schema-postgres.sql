-- PostgreSQL용 store_products 스키마 복구 스크립트
-- 컬럼이 비어 있거나(raw_payload 없음) 깨진 경우 복구

ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS uid BIGSERIAL;
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS store_uid BIGINT;
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS seller_product_id VARCHAR(50);
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS vendor_item_id VARCHAR(50);
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS status_type VARCHAR(50);
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS raw_payload TEXT;
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP;

UPDATE public.store_products SET vendor_item_id = '' WHERE vendor_item_id IS NULL;
UPDATE public.store_products SET seller_product_id = '(unknown)' WHERE seller_product_id IS NULL;
UPDATE public.store_products SET raw_payload = '{}' WHERE raw_payload IS NULL;
UPDATE public.store_products SET synced_at = NOW() WHERE synced_at IS NULL;

ALTER TABLE public.store_products ALTER COLUMN store_uid SET NOT NULL;
ALTER TABLE public.store_products ALTER COLUMN seller_product_id SET NOT NULL;
ALTER TABLE public.store_products ALTER COLUMN vendor_item_id SET NOT NULL;
ALTER TABLE public.store_products ALTER COLUMN synced_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'store_products_pkey'
    ) THEN
        ALTER TABLE public.store_products ADD CONSTRAINT store_products_pkey PRIMARY KEY (uid);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_store_products_store_seller_vendor'
    ) THEN
        ALTER TABLE public.store_products
            ADD CONSTRAINT uk_store_products_store_seller_vendor
            UNIQUE (store_uid, seller_product_id, vendor_item_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_store_products_store_uid'
    ) THEN
        ALTER TABLE public.store_products
            ADD CONSTRAINT fk_store_products_store_uid
            FOREIGN KEY (store_uid) REFERENCES public.stores(uid);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_store_products_store_uid ON public.store_products(store_uid);
CREATE INDEX IF NOT EXISTS idx_store_products_vendor_item_id ON public.store_products(vendor_item_id);
CREATE INDEX IF NOT EXISTS idx_store_products_seller_product_id ON public.store_products(seller_product_id);
