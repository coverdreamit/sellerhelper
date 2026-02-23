package com.sellerhelper.service;

import com.sellerhelper.dto.role.RoleResponse;
import com.sellerhelper.entity.Role;
import com.sellerhelper.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/** 권한 조회 서비스 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;

    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .uid(role.getUid())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }
}
