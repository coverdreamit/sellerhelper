package com.sellerhelper.service;

import com.sellerhelper.dto.common.PageResponse;
import com.sellerhelper.dto.naver.*;
import com.sellerhelper.dto.order.OrderActionResponse;
import com.sellerhelper.dto.order.OrderDetailResponse;
import com.sellerhelper.dto.order.OrderDispatchRequest;
import com.sellerhelper.dto.order.OrderItemDetailResponse;
import com.sellerhelper.dto.order.ClaimListResponse;
import com.sellerhelper.dto.order.OrderListResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Order;
import com.sellerhelper.entity.OrderItem;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.OrderItemRepository;
import com.sellerhelper.repository.OrderRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.service.coupang.CoupangOrderSyncService;
import com.sellerhelper.service.naver.NaverCommerceOrderService;
import com.sellerhelper.service.naver.NaverOrderSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** 스토어별 주문·배송 조회 (플랫폼별 위임) */
@Service
@RequiredArgsConstructor
public class StoreOrderService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final NaverCommerceOrderService naverOrderService;
    private final NaverOrderSyncService naverOrderSyncService;
    private final CoupangOrderSyncService coupangOrderSyncService;

    /**
     * 내 스토어 변경 주문 내역 조회 (본인 회사 스토어만, 네이버)
     * 조회 구간은 최대 24시간. 더 긴 기간은 일별로 반복 호출 필요.
     */
    @Transactional(readOnly = true)
    public NaverLastChangedResult getMyStoreLastChangedOrders(
            Long userUid,
            Long storeUid,
            ZonedDateTime lastChangedFrom,
            ZonedDateTime lastChangedTo,
            Integer limitCount,
            Integer moreSequence) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"NAVER".equalsIgnoreCase(mallCode)) {
            return NaverLastChangedResult.builder()
                    .data(Collections.emptyList())
                    .more(null)
                    .build();
        }
        return naverOrderService.getLastChangedProductOrders(
                storeUid, lastChangedFrom, lastChangedTo, limitCount, moreSequence);
    }

    /**
     * 내 스토어 상품 주문 상세 조회 (상품 주문 번호 최대 300개)
     */
    @Transactional(readOnly = true)
    public List<NaverProductOrderDetail> getMyStoreProductOrderDetails(Long userUid, Long storeUid, List<String> productOrderIds) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"NAVER".equalsIgnoreCase(mallCode)) {
            return Collections.emptyList();
        }
        return naverOrderService.getProductOrderDetails(storeUid, productOrderIds);
    }

    /**
     * 내 스토어 주문 목록 DB 조회 (네이버 동기화 저장분)
     */
    @Transactional(readOnly = true)
    public PageResponse<OrderListResponse> getMyStoreOrdersFromDb(Long userUid, Long storeUid, int page, int size) {
        ensureMyStore(userUid, storeUid);
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.of(
                orderRepository.findByStore_UidOrderByOrderDateDesc(storeUid, pageable)
                        .map(this::toOrderListResponse));
    }

    /**
     * 내 스토어 취소/반품/교환 목록 조회 (OrderItem 기준, productOrderStatus에 CANCEL/RETURN/EXCHANGE 포함된 건)
     * @param claimType null 또는 빈값=전체, cancel=취소, return=반품, exchange=교환
     * @param keyword 주문번호(mallOrderNo) 또는 클레임번호(mallItemId) 검색
     */
    @Transactional(readOnly = true)
    public PageResponse<ClaimListResponse> getMyStoreClaimList(
            Long userUid, Long storeUid, int page, int size,
            String claimType, String keyword) {
        ensureMyStore(userUid, storeUid);
        Pageable pageable = PageRequest.of(page, size);
        String searchKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        Page<OrderItem> itemPage;
        if (StringUtils.hasText(claimType)) {
            String claimKeyword = claimType.trim().toUpperCase();
            if ("CANCEL".equals(claimKeyword) || "RETURN".equals(claimKeyword) || "EXCHANGE".equals(claimKeyword)) {
                itemPage = orderItemRepository.findClaimItemsByStoreAndType(storeUid, claimKeyword, searchKeyword, pageable);
            } else {
                itemPage = orderItemRepository.findClaimItemsByStoreAllTypes(storeUid, searchKeyword, pageable);
            }
        } else {
            itemPage = orderItemRepository.findClaimItemsByStoreAllTypes(storeUid, searchKeyword, pageable);
        }
        return PageResponse.of(itemPage.map(this::toClaimListResponse));
    }

    /**
     * 내 스토어 배송 목록 조회 (주문 DB 저장분, 상태 필터 가능)
     * orderStatus: null/전체, PAYED=출고대기, DELIVERING=배송중, DELIVERED=배송완료
     */
    @Transactional(readOnly = true)
    public PageResponse<OrderListResponse> getMyStoreShippingList(Long userUid, Long storeUid, int page, int size, String orderStatus) {
        ensureMyStore(userUid, storeUid);
        Pageable pageable = PageRequest.of(page, size);
        if (orderStatus != null && !orderStatus.isBlank()) {
            return PageResponse.of(
                    orderRepository.findByStore_UidAndOrderStatusOrderByOrderDateDesc(storeUid, orderStatus.trim(), pageable)
                            .map(this::toOrderListResponse));
        }
        return PageResponse.of(
                orderRepository.findByStore_UidOrderByOrderDateDesc(storeUid, pageable)
                        .map(this::toOrderListResponse));
    }

    /**
     * 네이버 스마트스토어 주문 API → DB 동기화 (최근 24시간 변경분)
     */
    @Transactional
    public int syncMyStoreOrdersFromNaver(Long userUid, Long storeUid) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"NAVER".equalsIgnoreCase(mallCode)) {
            throw new IllegalArgumentException("네이버 스토어만 주문 동기화가 가능합니다.");
        }
        ZoneId zone = ZoneId.of("Asia/Seoul");
        ZonedDateTime now = ZonedDateTime.now(zone);
        ZonedDateTime from = orderRepository.findTopByStore_UidOrderByOrderDateDesc(storeUid)
                .map(Order::getOrderDate)
                .map(instant -> instant.atZone(zone).minusHours(1))
                .orElse(now.minusDays(7));
        return naverOrderSyncService.syncOrdersFromNaver(storeUid, from, now);
    }

    /**
     * 쿠팡 RG 주문 API → DB 동기화 (결제일 기준 최근 30일)
     */
    @Transactional
    public int syncMyStoreOrdersFromCoupang(Long userUid, Long storeUid) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"COUPANG".equalsIgnoreCase(mallCode)) {
            throw new IllegalArgumentException("쿠팡 스토어만 주문 동기화가 가능합니다.");
        }
        java.time.LocalDate to = java.time.LocalDate.now();
        java.time.LocalDate from = to.minusDays(30);
        return coupangOrderSyncService.syncOrdersFromCoupang(storeUid, from, to);
    }

    /**
     * 스토어 플랫폼에 따라 주문 동기화 (네이버: 24시간 변경분, 쿠팡: 최근 30일 결제분)
     */
    @Transactional
    public int syncMyStoreOrders(Long userUid, Long storeUid) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if ("NAVER".equalsIgnoreCase(mallCode)) {
            return syncMyStoreOrdersFromNaver(userUid, storeUid);
        }
        if ("COUPANG".equalsIgnoreCase(mallCode)) {
            return syncMyStoreOrdersFromCoupang(userUid, storeUid);
        }
        throw new IllegalArgumentException("주문 동기화를 지원하지 않는 스토어입니다. (네이버/쿠팡만 가능)");
    }

    /** 주문 상세 조회 (DB 저장분 + 상품주문 목록) */
    @Transactional(readOnly = true)
    public OrderDetailResponse getMyStoreOrderDetail(Long userUid, Long storeUid, Long orderUid) {
        ensureMyStore(userUid, storeUid);
        Order order = orderRepository.findByUidAndStore_Uid(orderUid, storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderUid));
        List<OrderItem> items = orderItemRepository.findByOrder_Uid(order.getUid());
        return OrderDetailResponse.builder()
                .uid(order.getUid())
                .storeUid(order.getStore() != null ? order.getStore().getUid() : null)
                .storeName(order.getStore() != null ? order.getStore().getName() : null)
                .mallOrderNo(order.getMallOrderNo())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress())
                .items(items.stream().map(this::toOrderItemDetailResponse).collect(Collectors.toList()))
                .build();
    }

    /** 네이버 발주 확인 처리 (주문의 상품주문번호 전체) */
    @Transactional
    public OrderActionResponse confirmMyStoreOrder(Long userUid, Long storeUid, Long orderUid) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"NAVER".equalsIgnoreCase(mallCode)) {
            throw new IllegalArgumentException("네이버 스토어만 발주 확인이 가능합니다.");
        }
        Order order = orderRepository.findByUidAndStore_Uid(orderUid, storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderUid));
        List<String> productOrderIds = orderItemRepository.findByOrder_Uid(order.getUid()).stream()
                .map(OrderItem::getMallItemId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());
        if (productOrderIds.isEmpty()) {
            throw new IllegalArgumentException("발주 확인할 상품 주문 번호가 없습니다.");
        }
        Object data = naverOrderService.confirmProductOrders(storeUid, productOrderIds);
        return OrderActionResponse.builder()
                .success(true)
                .action("CONFIRM")
                .requestedCount(productOrderIds.size())
                .data(data)
                .build();
    }

    /** 네이버 발송 처리 (주문의 상품주문번호 전체 동일 송장 적용) */
    @Transactional
    public OrderActionResponse dispatchMyStoreOrder(Long userUid, Long storeUid, Long orderUid, OrderDispatchRequest request) {
        ensureMyStore(userUid, storeUid);
        String mallCode = getStoreMallCode(storeUid);
        if (!"NAVER".equalsIgnoreCase(mallCode)) {
            throw new IllegalArgumentException("네이버 스토어만 발송 처리가 가능합니다.");
        }
        Order order = orderRepository.findByUidAndStore_Uid(orderUid, storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderUid));
        List<String> productOrderIds = orderItemRepository.findByOrder_Uid(order.getUid()).stream()
                .map(OrderItem::getMallItemId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());
        if (productOrderIds.isEmpty()) {
            throw new IllegalArgumentException("발송 처리할 상품 주문 번호가 없습니다.");
        }
        List<NaverCommerceOrderService.DispatchItem> dispatchItems = new ArrayList<>();
        for (String productOrderId : productOrderIds) {
            NaverCommerceOrderService.DispatchItem item = new NaverCommerceOrderService.DispatchItem();
            item.setProductOrderId(productOrderId);
            item.setDeliveryMethod("DELIVERY");
            item.setDeliveryCompany(request.getDeliveryCompany().trim());
            item.setTrackingNumber(request.getTrackingNumber().trim());
            dispatchItems.add(item);
        }
        Object data = naverOrderService.dispatchProductOrders(storeUid, dispatchItems);
        return OrderActionResponse.builder()
                .success(true)
                .action("DISPATCH")
                .requestedCount(productOrderIds.size())
                .data(data)
                .build();
    }

    private ClaimListResponse toClaimListResponse(OrderItem oi) {
        Order o = oi.getOrder();
        String status = oi.getProductOrderStatus() != null ? oi.getProductOrderStatus().toUpperCase() : "";
        String claimType = status.contains("CANCEL") ? "CANCEL" : status.contains("RETURN") ? "RETURN" : status.contains("EXCHANGE") ? "EXCHANGE" : oi.getProductOrderStatus();
        return ClaimListResponse.builder()
                .orderItemUid(oi.getUid())
                .orderUid(o != null ? o.getUid() : null)
                .mallOrderNo(o != null ? o.getMallOrderNo() : null)
                .mallItemId(oi.getMallItemId())
                .storeUid(o != null && o.getStore() != null ? o.getStore().getUid() : null)
                .storeName(o != null && o.getStore() != null ? o.getStore().getName() : null)
                .claimType(claimType)
                .productOrderStatus(oi.getProductOrderStatus())
                .productName(oi.getProductName())
                .optionInfo(oi.getOptionInfo())
                .quantity(oi.getQuantity())
                .totalPrice(oi.getTotalPrice())
                .orderDate(o != null ? o.getOrderDate() : null)
                .build();
    }

    private OrderListResponse toOrderListResponse(Order o) {
        int itemCount = orderItemRepository.findByOrder_Uid(o.getUid()).size();
        return OrderListResponse.builder()
                .uid(o.getUid())
                .storeUid(o.getStore() != null ? o.getStore().getUid() : null)
                .storeName(o.getStore() != null ? o.getStore().getName() : null)
                .mallOrderNo(o.getMallOrderNo())
                .orderDate(o.getOrderDate())
                .orderStatus(o.getOrderStatus())
                .totalAmount(o.getTotalAmount())
                .buyerName(o.getBuyerName())
                .buyerPhone(o.getBuyerPhone())
                .receiverName(o.getReceiverName())
                .receiverAddress(o.getReceiverAddress())
                .itemCount(itemCount)
                .build();
    }

    private OrderItemDetailResponse toOrderItemDetailResponse(OrderItem oi) {
        return OrderItemDetailResponse.builder()
                .uid(oi.getUid())
                .mallItemId(oi.getMallItemId())
                .productName(oi.getProductName())
                .optionInfo(oi.getOptionInfo())
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .totalPrice(oi.getTotalPrice())
                .productOrderStatus(oi.getProductOrderStatus())
                .build();
    }

    private void ensureMyStore(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 주문을 조회할 권한이 없습니다.");
        }
    }

    private String getStoreMallCode(Long storeUid) {
        return storeRepository.findById(storeUid)
                .map(s -> s.getMall() != null ? s.getMall().getCode() : null)
                .orElse(null);
    }
}
