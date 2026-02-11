package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 쇼핑몰별 상품 매핑
 */
@Entity
@Table(name = "product_malls", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_uid", "store_uid"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_uid", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_uid", nullable = false)
    private Store store;

    /** 해당 쇼핑몰 상품 ID */
    @Column(name = "mall_product_id", length = 100)
    private String mallProductId;

    @Column(name = "sync_status", length = 20)
    private String syncStatus;
}
