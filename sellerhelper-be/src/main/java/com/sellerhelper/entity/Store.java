package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 연동 스토어 (쇼핑몰 계정 1개 단위)
 */
@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mall_uid", nullable = false)
    private Mall mall;

    @Column(nullable = false, length = 100)
    private String name;

    /** 쇼핑몰 셀러/스토어 식별자 */
    @Column(name = "mall_seller_id", length = 100)
    private String mallSellerId;

    @Column(nullable = false)
    private Boolean enabled = true;
}
