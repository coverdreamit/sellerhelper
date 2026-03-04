package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * 스토어 API 인증 정보 (키, 토큰 등)
 */
@Entity
@Table(name = "store_auths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_uid", nullable = false, unique = true)
    private Store store;

    @Column(name = "api_key", length = 500)
    private String apiKey;

    @Column(name = "api_secret", length = 500)
    private String apiSecret;

    @Column(name = "access_token", length = 1000)
    private String accessToken;

    @Column(name = "refresh_token", length = 1000)
    private String refreshToken;

    @Column(name = "token_expires_at")
    private Instant tokenExpiresAt;

    /** API 연동 검증 성공 시각 (이 시각이 있어야 연동됨으로 표시) */
    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(length = 50)
    private String createdBy;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
