package com.sellerhelper.core.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT 클레임으로부터 복원한 인증 사용자 (Portal/API 공통)
 */
@Getter
public class AuthUser implements UserDetails {

    private final Long uid;
    private final String loginId;
    private final String name;
    private final List<String> roleCodes;
    private final Long companyUid;

    public AuthUser(Long uid, String loginId, String name, List<String> roleCodes, Long companyUid) {
        this.uid = uid;
        this.loginId = loginId;
        this.name = name;
        this.roleCodes = roleCodes != null ? roleCodes : Collections.emptyList();
        this.companyUid = companyUid;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roleCodes.stream()
                .map(rc -> new SimpleGrantedAuthority("ROLE_" + rc))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return loginId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
