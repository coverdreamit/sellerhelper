package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 상품 마스터 (상품관리)
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "product_no", length = 50)
    private String productNo;

    @Column(length = 50)
    private String barcode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sale_price", precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "cost_price", precision = 15, scale = 2)
    private BigDecimal costPrice;

    @Column(nullable = false)
    private Boolean enabled = true;
}
