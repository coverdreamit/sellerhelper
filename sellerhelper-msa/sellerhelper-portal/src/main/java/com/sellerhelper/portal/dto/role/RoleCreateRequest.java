package com.sellerhelper.portal.dto.role;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

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

    private List<String> menuKeys;
}
