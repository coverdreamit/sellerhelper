package com.sellerhelper.portal.dto.company;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

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
