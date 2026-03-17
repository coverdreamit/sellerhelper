package com.sellerhelper.dto.order;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class OrderDispatchRequest {
    @NotBlank(message = "택배사 코드를 입력하세요")
    private String deliveryCompany;

    @NotBlank(message = "송장번호를 입력하세요")
    private String trackingNumber;
}
