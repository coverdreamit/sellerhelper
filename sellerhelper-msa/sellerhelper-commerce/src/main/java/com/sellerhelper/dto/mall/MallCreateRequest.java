package com.sellerhelper.dto.mall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/** 플랫폼(Mall) 생성 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MallCreateRequest {

    @NotBlank(message = "플랫폼 코드는 필수입니다")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "플랫폼명은 필수입니다")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String channel;

    @Size(max = 500)
    private String description;

    @Size(max = 255)
    private String apiBaseUrl;

    private Boolean enabled = true;
}
