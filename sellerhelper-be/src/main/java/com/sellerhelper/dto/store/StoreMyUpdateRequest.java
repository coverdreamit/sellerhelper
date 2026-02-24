package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Size;

/** 셀러용 내 스토어 수정 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreMyUpdateRequest {

    @Size(max = 100)
    private String name;

    private Boolean enabled;

    @Size(max = 500)
    private String apiKey;

    @Size(max = 500)
    private String apiSecret;
}
