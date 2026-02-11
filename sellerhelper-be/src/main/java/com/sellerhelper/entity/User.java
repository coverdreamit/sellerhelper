package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * 시스템 사용자 (시스템관리 > 사용자 관리)
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String loginId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private Boolean enabled = true;

    private Instant lastLoginAt;
}
