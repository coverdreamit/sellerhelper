package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.vendor.VendorOrderFormResponse;
import com.sellerhelper.dto.vendor.VendorOrderFormSaveRequest;
import com.sellerhelper.service.VendorOrderFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@Profile({"portal", "commerce", "local"})
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VendorOrderFormController {

    private final VendorOrderFormService vendorOrderFormService;

    /** 로그인 사용자의 모든 발주 양식 (주문 목록 내보내기용) */
    @GetMapping("/vendor-order-forms")
    public ResponseEntity<List<VendorOrderFormResponse>> listMine(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorOrderFormService.findMyForms(authUser.getUid()));
    }

    @GetMapping("/vendors/{vendorId}/order-forms")
    public ResponseEntity<List<VendorOrderFormResponse>> listByVendor(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorOrderFormService.findByVendor(authUser.getUid(), vendorId));
    }

    @PostMapping("/vendors/{vendorId}/order-forms")
    public ResponseEntity<VendorOrderFormResponse> create(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorOrderFormSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vendorOrderFormService.create(authUser.getUid(), vendorId, request));
    }

    @PutMapping("/vendors/{vendorId}/order-forms/{formUid}")
    public ResponseEntity<VendorOrderFormResponse> update(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @PathVariable Long formUid,
            @Valid @RequestBody VendorOrderFormSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorOrderFormService.update(authUser.getUid(), vendorId, formUid, request));
    }

    @DeleteMapping("/vendors/{vendorId}/order-forms/{formUid}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @PathVariable Long formUid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        vendorOrderFormService.delete(authUser.getUid(), vendorId, formUid);
        return ResponseEntity.noContent().build();
    }
}
