package com.sellerhelper.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

/** 발주업체 정책 (발주업체와 1:1) */
@Entity
@Table(name = "vendor_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPolicy extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_uid", nullable = false, unique = true)
    private Vendor vendor;

    @Column(name = "auto_order_enabled", nullable = false)
    @Builder.Default
    private Boolean autoOrderEnabled = false;

    @Column(name = "stock_threshold", nullable = false)
    @Builder.Default
    private Integer stockThreshold = 0;

    @Column(name = "default_order_qty", nullable = false)
    @Builder.Default
    private Integer defaultOrderQty = 0;

    @Column(name = "order_unit", nullable = false, length = 20)
    @Builder.Default
    private String orderUnit = "EA";

    @Column(name = "lead_time_days", nullable = false)
    @Builder.Default
    private Integer leadTimeDays = 0;

    @Column(name = "include_weekend", nullable = false)
    @Builder.Default
    private Boolean includeWeekend = false;

    @Column(name = "min_order_qty", nullable = false)
    @Builder.Default
    private Integer minOrderQty = 1;

    @Column(name = "min_order_amount", nullable = false)
    @Builder.Default
    private Long minOrderAmount = 0L;

    @Column(name = "shipping_type", nullable = false, length = 20)
    @Builder.Default
    private String shippingType = "DIRECT";

    @Column(name = "bundle_allowed", nullable = false)
    @Builder.Default
    private Boolean bundleAllowed = true;

    @Column(name = "orderable_days", length = 100)
    private String orderableDays;

    @Column(name = "cutoff_time", length = 10)
    private String cutoffTime;

    @Column(name = "use_yn", nullable = false, length = 1)
    @Builder.Default
    private String useYn = "Y";

    @Column(length = 500)
    private String memo;
}
