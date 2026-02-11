package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 쇼핑몰 마스터 (쿠팡, 네이버, 11번가 등)
 */
@Entity
@Table(name = "malls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mall extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    /** API 베이스 URL 등 */
    @Column(name = "api_base_url", length = 255)
    private String apiBaseUrl;

    @Column(nullable = false)
    private Boolean enabled = true;
}
