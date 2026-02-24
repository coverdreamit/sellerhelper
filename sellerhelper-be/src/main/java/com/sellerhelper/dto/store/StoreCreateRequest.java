package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/** 스토어 생성 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreCreateRequest {

    @NotNull(message = "플랫폼(mall) UID는 필수입니다")
    private Long mallUid;

    private Long companyUid;

    @NotNull(message = "스토어명은 필수입니다")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String mallSellerId;

    private Boolean enabled = true;
}
