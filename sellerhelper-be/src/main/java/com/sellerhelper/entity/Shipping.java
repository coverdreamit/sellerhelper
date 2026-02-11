package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * 배송 (배송관리)
 */
@Entity
@Table(name = "shippings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipping extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_uid", nullable = false)
    private Order order;

    @Column(name = "shipping_status", length = 20)
    private String shippingStatus;

    @Column(name = "carrier", length = 50)
    private String carrier;

    @Column(name = "tracking_no", length = 100)
    private String trackingNo;

    @Column(name = "shipped_at")
    private Instant shippedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;
}
