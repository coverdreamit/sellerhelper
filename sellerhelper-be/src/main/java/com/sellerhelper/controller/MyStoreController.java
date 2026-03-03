package com.sellerhelper.controller;

import com.sellerhelper.config.AuthUser;
import com.sellerhelper.dto.naver.NaverLastChangedResult;
import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductOrderDetail;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.dto.store.StoreConnectRequest;
import com.sellerhelper.dto.store.StoreMyUpdateRequest;
import com.sellerhelper.dto.store.StoreReorderRequest;
import com.sellerhelper.dto.store.StoreResponse;
import com.sellerhelper.service.StoreOrderService;
import com.sellerhelper.service.StoreProductService;
import com.sellerhelper.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.ZonedDateTime;
import java.util.List;

/** 셀러용 스토어 연동 API (환경설정 > 스토어 연동) */
@RestController
@RequestMapping("/api/my-stores")
@RequiredArgsConstructor
public class MyStoreController {

    private final StoreService storeService;
    private final StoreProductService storeProductService;
    private final StoreOrderService storeOrderService;

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

    /** 내 스토어 변경 주문 내역 조회 (네이버, 변경 일시 기준 최대 24시간 구간) */
    @GetMapping("/{uid}/orders/last-changed")
    public ResponseEntity<NaverLastChangedResult> getLastChangedOrders(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestParam String lastChangedFrom,
            @RequestParam(required = false) String lastChangedTo,
            @RequestParam(defaultValue = "300") Integer limitCount,
            @RequestParam(required = false) Integer moreSequence) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ZonedDateTime from = ZonedDateTime.parse(lastChangedFrom);
        ZonedDateTime to = lastChangedTo != null ? ZonedDateTime.parse(lastChangedTo) : null;
        return ResponseEntity.ok(storeOrderService.getMyStoreLastChangedOrders(
                authUser.getUid(), uid, from, to, limitCount, moreSequence));
    }

    /** 내 스토어 상품 주문 상세 조회 (상품 주문 번호 최대 300개) */
    @PostMapping("/{uid}/orders/details")
    public ResponseEntity<List<NaverProductOrderDetail>> getProductOrderDetails(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestBody List<String> productOrderIds) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.getMyStoreProductOrderDetails(authUser.getUid(), uid, productOrderIds));
    }

    /** 내 스토어 상품목록 조회 (네이버: API 직접, 쿠팡: DB 저장분) */
    @GetMapping("/{uid}/products")
    public ResponseEntity<NaverProductSearchResult> getProducts(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeProductService.getMyStoreProducts(authUser.getUid(), uid, page, size));
    }

    /** 스토어 상품 목록 동기화 (네이버/쿠팡 등 API → DB 저장, 목록은 DB 조회) */
    @PostMapping("/{uid}/products/sync")
    public ResponseEntity<Void> syncProducts(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        storeProductService.syncStoreProducts(authUser.getUid(), uid);
        return ResponseEntity.noContent().build();
    }

    /** 내 스토어 상품 단건 조회 (쿠팡: sellerProductId) */
    @GetMapping("/{uid}/products/{productId}")
    public ResponseEntity<NaverProductItem> getProduct(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @PathVariable String productId) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        NaverProductItem item = storeProductService.getMyStoreProduct(authUser.getUid(), uid, productId);
        return item != null ? ResponseEntity.ok(item) : ResponseEntity.notFound().build();
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
