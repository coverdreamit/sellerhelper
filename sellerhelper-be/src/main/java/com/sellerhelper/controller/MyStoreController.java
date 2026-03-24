package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.naver.NaverLastChangedResult;
import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductOrderDetail;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.dto.common.PageResponse;
import com.sellerhelper.dto.order.ClaimListResponse;
import com.sellerhelper.dto.order.OrderActionResponse;
import com.sellerhelper.dto.order.OrderDetailResponse;
import com.sellerhelper.dto.order.OrderDispatchRequest;
import com.sellerhelper.dto.order.OrderListResponse;
import com.sellerhelper.dto.order.PurchaseOrderExportRequest;
import com.sellerhelper.dto.store.StoreConnectRequest;
import com.sellerhelper.dto.store.StoreMyUpdateRequest;
import com.sellerhelper.dto.store.StoreReorderRequest;
import com.sellerhelper.dto.store.StoreResponse;
import com.sellerhelper.service.PurchaseOrderExportService;
import com.sellerhelper.service.StoreOrderService;
import com.sellerhelper.service.StoreProductService;
import com.sellerhelper.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZonedDateTime;
import java.util.List;

/** 셀러용 스토어 연동 API (commerce 프로필) */
@Profile({"commerce", "local"})
@RestController
@RequestMapping("/api/my-stores")
@RequiredArgsConstructor
public class MyStoreController {

    private final StoreService storeService;
    private final StoreProductService storeProductService;
    private final StoreOrderService storeOrderService;
    private final PurchaseOrderExportService purchaseOrderExportService;

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

    /** 내 스토어 주문 목록 (DB 저장분, 네이버 동기화 후 조회) */
    @GetMapping("/{uid}/orders")
    public ResponseEntity<PageResponse<OrderListResponse>> getOrders(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.getMyStoreOrdersFromDb(authUser.getUid(), uid, page, size));
    }

    /** 내 스토어 주문 상세 (DB 저장분) */
    @GetMapping("/{uid}/orders/{orderUid}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @PathVariable Long orderUid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.getMyStoreOrderDetail(authUser.getUid(), uid, orderUid));
    }

    /** 내 스토어 주문 동기화 (네이버: 최근 24시간 변경분, 쿠팡: 최근 30일 결제분 → DB) */
    @PostMapping("/{uid}/orders/sync")
    public ResponseEntity<Integer> syncOrders(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        int count = storeOrderService.syncMyStoreOrders(authUser.getUid(), uid);
        return ResponseEntity.ok(count);
    }

    /** 내 스토어 주문 발주 확인 처리 (네이버) */
    @PostMapping("/{uid}/orders/{orderUid}/confirm")
    public ResponseEntity<OrderActionResponse> confirmOrder(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @PathVariable Long orderUid) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.confirmMyStoreOrder(authUser.getUid(), uid, orderUid));
    }

    /** 내 스토어 주문 발송 처리 (네이버) */
    @PostMapping("/{uid}/orders/{orderUid}/dispatch")
    public ResponseEntity<OrderActionResponse> dispatchOrder(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @PathVariable Long orderUid,
            @Valid @RequestBody OrderDispatchRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.dispatchMyStoreOrder(authUser.getUid(), uid, orderUid, request));
    }

    /** 내 스토어 취소/반품/교환 목록 조회 (DB 저장분, claimType: cancel/return/exchange, keyword: 주문번호·클레임번호) */
    @GetMapping("/{uid}/claims")
    public ResponseEntity<PageResponse<ClaimListResponse>> getClaimList(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String claimType,
            @RequestParam(required = false) String keyword) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.getMyStoreClaimList(
                authUser.getUid(), uid, page, size, claimType, keyword));
    }

    /**
     * 선택한 주문으로 발주업체 양식 컬럼에 맞춰 발주서(xlsx) 다운로드.
     * 프론트 발주양식관리에 저장된 columnKeys와 동일한 키를 사용합니다.
     */
    @PostMapping("/{uid}/purchase-orders/export")
    public ResponseEntity<byte[]> exportPurchaseOrder(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @Valid @RequestBody PurchaseOrderExportRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        byte[] bytes = purchaseOrderExportService.exportExcel(authUser.getUid(), uid, request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmm"));
        String filename = "발주서_" + stamp + ".xlsx";
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(filename, StandardCharsets.UTF_8)
                .build());
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    /** 내 스토어 배송 목록 조회 (DB 저장분, orderStatus: PAYED=출고대기, DELIVERING=배송중, DELIVERED=배송완료) */
    @GetMapping("/{uid}/shipping")
    public ResponseEntity<PageResponse<OrderListResponse>> getShippingList(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long uid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String orderStatus) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storeOrderService.getMyStoreShippingList(authUser.getUid(), uid, page, size, orderStatus));
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
