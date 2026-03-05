package com.sellerhelper.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/** 사용자 생성 요청 */
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

    /** 부여할 권한 UID 목록 */
    private List<Long> roleUids;
}
