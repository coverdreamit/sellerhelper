package com.sellerhelper.portal.controller;

import com.sellerhelper.portal.dto.role.RoleCreateRequest;
import com.sellerhelper.portal.dto.role.RoleResponse;
import com.sellerhelper.portal.dto.role.RoleUpdateRequest;
import com.sellerhelper.portal.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping("/{uid}")
    public ResponseEntity<RoleResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(roleService.findByUid(uid));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody RoleCreateRequest req) {
        return ResponseEntity.ok(roleService.create(req));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<RoleResponse> update(@PathVariable Long uid, @Valid @RequestBody RoleUpdateRequest req) {
        return ResponseEntity.ok(roleService.update(uid, req));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        roleService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}
