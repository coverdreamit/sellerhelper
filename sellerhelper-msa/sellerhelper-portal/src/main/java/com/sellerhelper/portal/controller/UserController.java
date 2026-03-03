package com.sellerhelper.portal.controller;

import com.sellerhelper.portal.dto.common.PageResponse;
import com.sellerhelper.portal.dto.user.UserCreateRequest;
import com.sellerhelper.portal.dto.user.UserListResponse;
import com.sellerhelper.portal.dto.user.UserResponse;
import com.sellerhelper.portal.dto.user.UserUpdateRequest;
import com.sellerhelper.portal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PageResponse<UserListResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uid") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(userService.search(keyword, roleCode, enabled, pageable));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<UserResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(userService.findById(uid));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long uid,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(uid, request));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        userService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}
