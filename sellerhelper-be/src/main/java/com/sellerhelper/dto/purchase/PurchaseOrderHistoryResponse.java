package com.sellerhelper.dto.purchase;

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
public class PurchaseOrderHistoryResponse {
    private Long uid;
    private String name;
    private String memo;
    private Long storeUid;
    private String storeName;
    private Long vendorId;
    private String vendorName;
    private List<Long> orderUids;
    private List<String> columnKeys;
    private Instant createdAt;
    private Instant updatedAt;
}
