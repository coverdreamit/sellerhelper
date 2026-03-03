package com.sellerhelper.portal.dto.user;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long uid;
    private String loginId;
    private String name;
    private String email;
    private String phone;
    private Boolean enabled;
    private Instant lastLoginAt;
    private Instant createdAt;
    private List<String> roleCodes;
    private List<String> roleNames;
}
