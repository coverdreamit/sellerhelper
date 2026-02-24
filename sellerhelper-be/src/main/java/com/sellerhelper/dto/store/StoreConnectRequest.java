package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/** 셀러 스토어 연동 요청 (플랫폼 선택 + API 키) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreConnectRequest {

    @NotNull(message = "플랫폼(mall) UID는 필수입니다")
    private Long mallUid;

    @NotNull(message = "스토어명은 필수입니다")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String apiKey;

    @Size(max = 500)
    private String apiSecret;
}
