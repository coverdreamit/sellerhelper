package com.sellerhelper.dto.role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/** 권한 생성 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleCreateRequest {

    @NotBlank(message = "권한 코드는 필수입니다")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "권한명은 필수입니다")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    /** 접근 가능 메뉴 키 목록 */
    private List<String> menuKeys;
}
