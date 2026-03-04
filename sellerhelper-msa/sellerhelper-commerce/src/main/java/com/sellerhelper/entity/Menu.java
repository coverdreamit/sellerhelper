package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 동적 메뉴 (시스템관리 > 메뉴 관리)
 */
@Entity
@Table(name = "menus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String key;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(length = 255)
    private String path;

    @Column(name = "parent_key", length = 50)
    private String parentKey;

    @Column(nullable = false)
    private Boolean enabled = true;
}
