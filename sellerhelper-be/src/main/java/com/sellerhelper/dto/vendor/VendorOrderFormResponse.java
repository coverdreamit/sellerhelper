package com.sellerhelper.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorOrderFormResponse {

    private Long formUid;
    private Long vendorUid;
    private String vendorName;
    private String formName;
    private boolean active;
    private List<String> columnKeys;
    private List<String> purchaseColumnKeys;
    private Instant updatedAt;
}
