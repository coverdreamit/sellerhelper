package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 회사/셀러 정보 (환경설정 > 기본 설정)
 */
@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "business_number", length = 20)
    private String businessNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String ceoName;
}
