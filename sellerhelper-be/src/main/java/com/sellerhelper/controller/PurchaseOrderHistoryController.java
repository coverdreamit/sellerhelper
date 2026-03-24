package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryCreateRequest;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryResponse;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryUpdateRequest;
import com.sellerhelper.service.PurchaseOrderHistoryService;
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

@Profile({"commerce", "local"})
@RestController
@RequestMapping("/api/purchase-order-histories")
@RequiredArgsConstructor
public class PurchaseOrderHistoryController {

    private final PurchaseOrderHistoryService purchaseOrderHistoryService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderHistoryResponse>> listMine(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(purchaseOrderHistoryService.findMine(authUser.getUid()));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderHistoryResponse> create(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody PurchaseOrderHistoryCreateRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseOrderHistoryService.create(authUser.getUid(), request));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<PurchaseOrderHistoryResponse> update(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @Valid @RequestBody PurchaseOrderHistoryUpdateRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(purchaseOrderHistoryService.update(authUser.getUid(), uid, request));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        purchaseOrderHistoryService.delete(authUser.getUid(), uid);
        return ResponseEntity.noContent().build();
    }
}
