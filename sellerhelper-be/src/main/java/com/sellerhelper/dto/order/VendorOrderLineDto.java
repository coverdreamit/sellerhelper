package com.sellerhelper.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 스토어 상품에 연결된 발주업체(assigned_vendor) 기준으로 필터한 주문 라인 1행.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorOrderLineDto {

    private Long orderUid;
    private String mallOrderNo;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Seoul")
    private Instant orderDate;
    private String orderStatus;
    private BigDecimal orderTotalAmount;
    private String buyerName;
    private String buyerPhone;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;

    private Long orderItemUid;
    private String mallItemId;
    private String productName;
    private String optionInfo;
    private Integer quantity;
    private String productOrderStatus;
    private String channelType;
    private String externalProductId;
    private String externalOptionId;
    private String sellerSku;
}
