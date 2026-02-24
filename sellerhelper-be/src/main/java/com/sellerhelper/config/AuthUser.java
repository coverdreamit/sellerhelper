package com.sellerhelper.config;

import com.sellerhelper.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/** Spring Security UserDetails - 세션에 저장될 인증 정보 */
@Getter
public class AuthUser implements UserDetails {

    private final Long uid;
    private final String loginId;
    private final String name;
    private final List<String> roleCodes;
    private final String password;
    private final boolean enabled;

    public AuthUser(User user, List<String> roleCodes) {
        this.uid = user.getUid();
        this.loginId = user.getLoginId();
        this.name = user.getName();
        this.roleCodes = roleCodes;
        this.password = user.getPassword();
        this.enabled = user.getEnabled();
    }

    /** 세션 저장용 - 비밀번호 제외 (보안) */
    public static AuthUser forSession(Long uid, String loginId, String name, List<String> roleCodes) {
        return new AuthUser(uid, loginId, name, roleCodes);
    }

    private AuthUser(Long uid, String loginId, String name, List<String> roleCodes) {
        this.uid = uid;
        this.loginId = loginId;
        this.name = name;
        this.roleCodes = roleCodes;
        this.password = "";
        this.enabled = true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roleCodes.stream()
                .map(rc -> new SimpleGrantedAuthority("ROLE_" + rc))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
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
}
