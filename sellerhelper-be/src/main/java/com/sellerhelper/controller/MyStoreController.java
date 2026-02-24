package com.sellerhelper.controller;

import com.sellerhelper.config.AuthUser;
import com.sellerhelper.dto.store.StoreConnectRequest;
import com.sellerhelper.dto.store.StoreMyUpdateRequest;
import com.sellerhelper.dto.store.StoreReorderRequest;
import com.sellerhelper.dto.store.StoreResponse;
import com.sellerhelper.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/** 셀러용 스토어 연동 API (환경설정 > 스토어 연동) */
@RestController
@RequestMapping("/api/my-stores")
@RequiredArgsConstructor
public class MyStoreController {

    private final StoreService storeService;

    /** 내 회사 스토어 목록 (연동된 스토어) */
    @GetMapping
    public ResponseEntity<List<StoreResponse>> list(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeService.findMyStores(authUser.getUid()));
    }

    /** 플랫폼 선택 + API 입력 → 스토어 연동 */
    @PostMapping
    public ResponseEntity<StoreResponse> connect(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody StoreConnectRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.connectStore(authUser.getUid(), request));
    }

    /** 스토어 순서 변경 (탭 순서 = 그리드 순서) */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody StoreReorderRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        storeService.reorderMyStores(authUser.getUid(), request.getStoreUids());
        return ResponseEntity.noContent().build();
    }

    /** 내 스토어 수정 (본인 회사 스토어만) */
    @PutMapping("/{uid}")
    public ResponseEntity<StoreResponse> update(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @Valid @RequestBody StoreMyUpdateRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeService.updateMyStore(authUser.getUid(), uid, request));
    }

    /** 연동 테스트 (실제 API 호출로 검증, 성공 시 연동됨으로 표시) */
    @PostMapping("/{uid}/verify")
    public ResponseEntity<StoreResponse> verify(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeService.verifyMyStore(authUser.getUid(), uid));
    }

    /** 연동 해제 (본인 회사 스토어만) */
    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> disconnect(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        storeService.disconnectMyStore(authUser.getUid(), uid);
        return ResponseEntity.noContent().build();
    }
}
