package com.sellerhelper.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 회사 응답 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponse {

    private Long uid;
    private String name;
    private String businessNumber;
    private String address;
    private String phone;
    private String email;
    private String ceoName;
}
