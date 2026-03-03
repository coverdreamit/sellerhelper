package com.sellerhelper.portal.dto.company;

import lombok.*;

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
