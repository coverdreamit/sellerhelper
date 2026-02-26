package com.sellerhelper.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/** 내 회사 등록 요청 (회사 정보 미등록 사용자용) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyCreateRequest {

    @NotBlank(message = "회사명은 필수입니다")
    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String businessNumber;

    @Size(max = 255)
    private String address;

    @Size(max = 50)
    private String phone;

    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String ceoName;
}
