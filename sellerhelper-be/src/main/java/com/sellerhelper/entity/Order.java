package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 주문 마스터 (주문관리)
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_uid", nullable = false)
    private Store store;

    @Column(name = "mall_order_no", nullable = false, length = 100)
    private String mallOrderNo;

    @Column(name = "order_date")
    private Instant orderDate;

    @Column(name = "order_status", length = 20)
    private String orderStatus;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "buyer_name", length = 100)
    private String buyerName;

    @Column(name = "buyer_phone", length = 50)
    private String buyerPhone;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", length = 50)
    private String receiverPhone;

    @Column(name = "receiver_address", length = 500)
    private String receiverAddress;
}
