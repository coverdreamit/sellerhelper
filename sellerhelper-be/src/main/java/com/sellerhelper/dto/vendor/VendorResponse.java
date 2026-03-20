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
    private String managerName;
    private String address;
    private String addressDetail;
    private String phone;
    private String email;
    private String orderMethod;
    private String shippingType;
    private Boolean isActive;
    private String memo;
    private String formTemplateFileName;
    private String formTemplateContentType;
    private Boolean hasFormTemplateFile;
    private Instant formTemplateUploadedAt;
    private java.util.List<VendorFormTemplateMappingItem> formTemplateMappings;
    private Instant createdAt;
    private Instant updatedAt;
}
