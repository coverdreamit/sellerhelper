package com.sellerhelper.entity;

import lombok.*;

import javax.persistence.*;
import java.time.Instant;

/**
 * 스토어별 상품 목록 스냅샷 (쿠팡 API 동기화 결과 저장).
 * 엑셀(가격/재고)과 동일하게 옵션 단위로 1행.
 */
@Entity
@Table(
    name = "store_products",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_uid", "seller_product_id", "vendor_item_id"})
    },
    indexes = {
        @Index(name = "idx_store_products_store_uid", columnList = "store_uid"),
        @Index(name = "idx_store_products_vendor_item_id", columnList = "vendor_item_id"),
        @Index(name = "idx_store_products_seller_product_id", columnList = "seller_product_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_uid", nullable = false)
    private Store store;

    /** 쿠팡 상품 ID (sellerProductId) */
    @Column(name = "seller_product_id", nullable = false, length = 50)
    private String sellerProductId;

    /** 쿠팡 옵션 ID (vendorItemId). 옵션 없으면 빈 문자열 */
    @Column(name = "vendor_item_id", nullable = false, length = 50)
    private String vendorItemId;

    @Column(name = "status_type", length = 50)
    private String statusType;

    /** 플랫폼 API 원문 JSON */
    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    /** 동기화 시각 (해당 스토어 전체 동기화 시 동일 값) */
    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt;
}
