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

    /** EXISTING(기존 회사 가입) | NEW(신규 회사 등록) */
    @Size(max = 20)
    private String registerCompanyMode;

    /** 기존 회사 가입 시 선택한 회사 UID */
    private Long existingCompanyUid;

    /** 신규 회사 등록 시 회사명 */
    @Size(max = 100)
    private String newCompanyName;

    /** 신규 회사 등록 시 사업자등록번호 */
    @Size(max = 20)
    private String newBusinessNumber;

    /** 하위 호환용 (기존 단일 회사명 입력 방식) */
    @Size(max = 100)
    private String companyName;
}
