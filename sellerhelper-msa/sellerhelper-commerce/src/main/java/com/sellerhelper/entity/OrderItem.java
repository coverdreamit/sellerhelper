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
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;
}
