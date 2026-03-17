package com.sellerhelper.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {

    private Long vendorId;
    private Long userId;
    private String vendorName;
    private String bizNo;
    private Boolean businessVerified;
    private Instant businessVerifiedAt;
    private String businessStatusCode;
    private String businessStatusText;
    private String businessTaxType;
    private String businessClosedAt;
    private String businessVerifyMessage;
    private String managerName;
    private String address;
    private String addressDetail;
    private String phone;
    private String email;
    private String orderMethod;
    private String shippingType;
    private Boolean isActive;
    private String memo;
    private VendorPolicyResponse policy;
    private Instant createdAt;
    private Instant updatedAt;
}
