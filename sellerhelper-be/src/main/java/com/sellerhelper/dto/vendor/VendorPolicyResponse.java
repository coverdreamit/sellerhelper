package com.sellerhelper.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPolicyResponse {

    private AutoOrder autoOrder;
    private LeadTime leadTime;
    private OrderLimit orderLimit;
    private Delivery delivery;
    private Schedule schedule;
    private String useYn;
    private String memo;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AutoOrder {
        private Boolean enabled;
        private Integer stockThreshold;
        private Integer defaultOrderQty;
        private String orderUnit;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeadTime {
        private Integer days;
        private Boolean includeWeekend;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderLimit {
        private Integer minOrderQty;
        private Long minOrderAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Delivery {
        private String shippingType;
        private Boolean bundleAllowed;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Schedule {
        private List<String> orderableDays;
        private String cutoffTime;
    }
}
