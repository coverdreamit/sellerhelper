package com.sellerhelper.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/** 회원가입 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "로그인 ID는 필수입니다")
    @Size(min = 4, max = 100)
    private String loginId;

    @NotBlank(message = "이메일은 필수입니다")
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 255)
    private String password;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String companyName;
}
