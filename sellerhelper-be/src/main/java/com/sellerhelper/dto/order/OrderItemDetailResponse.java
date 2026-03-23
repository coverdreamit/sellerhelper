package com.sellerhelper.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDetailResponse {
    private Long uid;
    private String mallItemId;
    private String productName;
    private String optionInfo;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String productOrderStatus;
    /** NAVER, COUPANG 등 */
    private String channelType;
    private String externalProductId;
    private String externalOptionId;
    private String sellerSku;
}
