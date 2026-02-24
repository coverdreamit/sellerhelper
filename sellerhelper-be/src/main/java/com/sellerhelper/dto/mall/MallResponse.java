package com.sellerhelper.dto.mall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 플랫폼(Mall) 응답 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MallResponse {

    private Long uid;
    private String code;
    private String name;
    private String channel;
    private String description;
    private String apiBaseUrl;
    private Boolean enabled;
    private Integer sortOrder;
}
