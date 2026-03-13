package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.vendor.VendorPolicyResponse;
import com.sellerhelper.dto.vendor.VendorPolicySaveRequest;
import com.sellerhelper.dto.vendor.VendorResponse;
import com.sellerhelper.dto.vendor.VendorSaveRequest;
import com.sellerhelper.service.VendorPolicyService;
import com.sellerhelper.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

/** 셀러용 발주업체 API */
@Profile({"portal", "commerce", "local"})
@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;
    private final VendorPolicyService vendorPolicyService;

    @GetMapping
    public ResponseEntity<List<VendorResponse>> list(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.findMyVendors(authUser.getUid()));
    }

    @PostMapping
    public ResponseEntity<VendorResponse> create(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody VendorSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vendorService.createMyVendor(authUser.getUid(), request));
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<VendorResponse> update(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.updateMyVendor(authUser.getUid(), vendorId, request));
    }

    @PutMapping("/{vendorId}/policy")
    public ResponseEntity<VendorPolicyResponse> savePolicy(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorPolicySaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorPolicyService.saveMyVendorPolicy(authUser.getUid(), vendorId, request));
    }
}
