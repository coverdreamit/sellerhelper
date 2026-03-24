-- 발주서 목록 저장용 테이블
CREATE TABLE IF NOT EXISTS purchase_order_histories (
    uid BIGINT NOT NULL AUTO_INCREMENT,
    sort_order INT NULL,
    sort VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    created_by VARCHAR(255) NULL,
    updated_at DATETIME(6) NULL,
    updated_by VARCHAR(255) NULL,
    user_uid BIGINT NOT NULL,
    store_uid BIGINT NOT NULL,
    vendor_uid BIGINT NOT NULL,
    form_name VARCHAR(200) NOT NULL,
    memo VARCHAR(1000) NULL,
    order_uids_json TEXT NOT NULL,
    column_keys_json TEXT NOT NULL,
    PRIMARY KEY (uid),
    INDEX idx_po_hist_user_created (user_uid, created_at),
    CONSTRAINT fk_po_hist_user FOREIGN KEY (user_uid) REFERENCES users(uid),
    CONSTRAINT fk_po_hist_store FOREIGN KEY (store_uid) REFERENCES stores(uid),
    CONSTRAINT fk_po_hist_vendor FOREIGN KEY (vendor_uid) REFERENCES vendors(uid)
);
