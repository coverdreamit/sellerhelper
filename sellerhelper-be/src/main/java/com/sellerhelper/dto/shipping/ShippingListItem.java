package com.sellerhelper.dto.shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** 배송 목록 1건 (프론트 표시용) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingListItem {

    private String orderId;
    private String storeName;
    private String receiverName;
    private String status;
    private String invoice;
    private Instant orderDate;
}
