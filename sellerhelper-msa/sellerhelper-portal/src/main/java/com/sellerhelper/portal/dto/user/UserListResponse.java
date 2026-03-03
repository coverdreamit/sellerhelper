package com.sellerhelper.portal.dto.user;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserListResponse {

    private Long uid;
    private String loginId;
    private String name;
    private String email;
    private String roleNames;
    private Boolean enabled;
    private Instant lastLoginAt;
    private Instant createdAt;
}
