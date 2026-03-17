package com.sellerhelper.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long uid;
    private Long storeUid;
    private String storeName;
    private String mallOrderNo;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Seoul")
    private Instant orderDate;
    private String orderStatus;
    private BigDecimal totalAmount;
    private String buyerName;
    private String buyerPhone;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private List<OrderItemDetailResponse> items;
}
