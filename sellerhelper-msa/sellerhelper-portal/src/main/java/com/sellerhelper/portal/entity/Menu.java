package com.sellerhelper.portal.entity;

import lombok.*;

import javax.persistence.*;

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
