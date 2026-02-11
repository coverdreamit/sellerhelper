package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 권한 (시스템관리 > 권한 관리)
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;
}
