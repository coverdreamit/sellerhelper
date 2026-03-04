package com.sellerhelper.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.Size;
import java.util.List;

/** 사용자 수정 요청 (비밀번호는 변경 시에만 전달) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {

    @Size(max = 100)
    private String name;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    private Boolean enabled;

    /** 비밀번호 변경 시에만 전달 (null/비어있으면 변경 안 함) */
    @Size(min = 6, max = 255)
    private String password;

    /** 부여할 권한 UID 목록 (null이면 기존 유지) */
    private List<Long> roleUids;
}
