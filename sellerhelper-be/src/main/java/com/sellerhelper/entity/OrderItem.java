package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 주문 상세
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_uid", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_uid")
    private Product product;

    @Column(name = "mall_item_id", length = 100)
    private String mallItemId;

    @Column(nullable = false, length = 255)
    private String productName;

    @Column(name = "option_info", length = 255)
    private String optionInfo;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;

    /** 네이버 상품주문 상태 (PAYED, DELIVERING 등) */
    @Column(name = "product_order_status", length = 50)
    private String productOrderStatus;

    /** NAVER, COUPANG 등 — 주문 동기화 시 스토어 몰 기준 설정 */
    @Column(name = "channel_type", length = 20)
    private String channelType;

    @Column(name = "external_product_id", length = 100)
    private String externalProductId;

    @Column(name = "external_option_id", length = 100)
    private String externalOptionId;

    /** 판매자/자체 SKU (채널 제공 시) */
    @Column(name = "seller_sku", length = 100)
    private String sellerSku;
}
