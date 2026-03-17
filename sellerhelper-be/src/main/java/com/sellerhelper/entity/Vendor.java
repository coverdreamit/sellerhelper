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
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.Instant;

/** 셀러 발주업체 */
@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_uid", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String vendorName;

    @Column(name = "business_number", length = 20)
    private String businessNumber;

    @Column(name = "business_verified", nullable = false)
    @Builder.Default
    private Boolean businessVerified = false;

    @Column(name = "business_verified_at")
    private Instant businessVerifiedAt;

    @Column(name = "business_status_code", length = 20)
    private String businessStatusCode;

    @Column(name = "business_status_text", length = 100)
    private String businessStatusText;

    @Column(name = "business_tax_type", length = 100)
    private String businessTaxType;

    @Column(name = "business_closed_at", length = 8)
    private String businessClosedAt;

    @Column(name = "business_verify_message", length = 255)
    private String businessVerifyMessage;

    @Column(length = 100)
    private String managerName;

    @Column(length = 255)
    private String address;

    @Column(length = 255)
    private String addressDetail;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String orderMethod;

    @Column(length = 20)
    private String shippingType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(length = 500)
    private String memo;
}
