package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 연동 스토어 (판매자 계정 1개 단위)
 * Mall(플랫폼) FK + Company(소유자) FK
 * API 키는 StoreAuth에 별도 저장
 */
@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store extends BaseEntity {

    /** 플랫폼 (코드 관리에서 등록) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mall_uid", nullable = false)
    private Mall mall;

    /** 소속 회사(셀러) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_uid")
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    /** 쇼핑몰 셀러/스토어 식별자 */
    @Column(name = "mall_seller_id", length = 100)
    private String mallSellerId;

    @Column(nullable = false)
    private Boolean enabled = true;
}
