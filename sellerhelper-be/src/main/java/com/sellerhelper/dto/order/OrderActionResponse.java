package com.sellerhelper.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderActionResponse {
    private boolean success;
    private String action;
    private int requestedCount;
    private Object data;
}
