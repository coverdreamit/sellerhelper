package com.sellerhelper.portal.dto.user;

import lombok.*;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequest {

    @NotBlank(message = "로그인 ID는 필수입니다")
    @Size(max = 100)
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 6, max = 255)
    private String password;

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 100)
    private String name;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @Builder.Default
    private Boolean enabled = true;

    private List<Long> roleUids;
}
