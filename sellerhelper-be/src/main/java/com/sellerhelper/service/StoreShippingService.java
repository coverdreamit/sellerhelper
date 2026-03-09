package com.sellerhelper.service;

import com.sellerhelper.dto.naver.*;
import com.sellerhelper.dto.shipping.ShippingListItem;
import com.sellerhelper.dto.shipping.ShippingListResult;
import com.sellerhelper.entity.Order;
import com.sellerhelper.entity.Shipping;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.OrderRepository;
import com.sellerhelper.repository.ShippingRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/** 스토어별 배송 목록 조회 및 네이버 API → DB 동기화 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StoreShippingService {

    private static final DateTimeFormatter NAVER_DATETIME = DateTimeFormatter.ISO_DATE_TIME;
    private static final int SYNC_DAYS = 7;
    private static final int MAX_PRODUCT_ORDERS_PER_BATCH = 300;

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;
    private final StoreOrderService storeOrderService;

    /**
     * 내 스토어 배송 목록 조회 (DB 저장분, 페이징)
     */
    @Transactional(readOnly = true)
    public ShippingListResult getShippingList(Long userUid, Long storeUid, int page, int size, String status) {
        ensureMyStore(userUid, storeUid);
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "order.orderDate"));
        var shippingPage = resolveStatusFilter(storeUid, status, pageable);

        List<ShippingListItem> items = shippingPage.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        Instant lastSyncedAt = items.isEmpty() ? null : shippingPage.getContent().get(0).getUpdatedAt();

        return ShippingListResult.builder()
                .contents(items)
                .page(page)
                .size(size)
                .totalCount(shippingPage.getTotalElements())
                .lastSyncedAt(lastSyncedAt)
                .build();
    }

    /**
     * 네이버 주문/배송 API → DB 동기화 (최근 SYNC_DAYS일 변경분)
     */
    @Transactional
    public void syncShippings(Long userUid, Long storeUid) {
        ensureMyStore(userUid, storeUid);
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime from = now.minusDays(SYNC_DAYS);
        List<String> productOrderIds = new ArrayList<>();
        Integer moreSequence = null;

        do {
            NaverLastChangedResult result = storeOrderService.getMyStoreLastChangedOrders(
                    userUid, storeUid, from, now, MAX_PRODUCT_ORDERS_PER_BATCH, moreSequence);
            if (result.getData() == null || result.getData().isEmpty()) {
                break;
            }
            for (NaverLastChangedItem item : result.getData()) {
                if (item.getProductOrderId() != null) {
                    productOrderIds.add(item.getProductOrderId());
                }
            }
            if (productOrderIds.size() >= MAX_PRODUCT_ORDERS_PER_BATCH) {
                break;
            }
            moreSequence = result.getMore() != null ? result.getMore().getMoreSequence() : null;
        } while (moreSequence != null);

        if (productOrderIds.isEmpty()) {
            log.info("배송 동기화: 변경된 주문 없음 storeUid={}", storeUid);
            return;
        }

        List<NaverProductOrderDetail> details = storeOrderService.getMyStoreProductOrderDetails(userUid, storeUid, productOrderIds);
        Map<String, List<NaverProductOrderDetail>> byOrderId = details.stream()
                .filter(d -> d.getOrder() != null && d.getOrder().getOrderId() != null)
                .collect(Collectors.groupingBy(d -> d.getOrder().getOrderId()));

        for (Map.Entry<String, List<NaverProductOrderDetail>> entry : byOrderId.entrySet()) {
            String orderId = entry.getKey();
            List<NaverProductOrderDetail> list = entry.getValue();
            NaverProductOrderDetail first = list.get(0);
            NaverOrderInfo orderInfo = first.getOrder();
            NaverProductOrderSummary summary = first.getProductOrder();
            NaverDeliveryInfo deliveryInfo = first.getDelivery();

            Order order = orderRepository.findByStoreUidAndMallOrderNo(storeUid, orderId).orElse(null);
            if (order == null) {
                order = Order.builder()
                        .store(store)
                        .mallOrderNo(orderId)
                        .orderDate(parseInstant(orderInfo.getOrderDate()))
                        .orderStatus(summary != null ? summary.getProductOrderStatus() : null)
                        .totalAmount(summary != null && summary.getTotalPaymentAmount() != null
                                ? BigDecimal.valueOf(summary.getTotalPaymentAmount()) : null)
                        .buyerName(orderInfo != null ? orderInfo.getOrdererName() : null)
                        .buyerPhone(orderInfo != null ? orderInfo.getOrdererTel() : null)
                        .receiverName(getReceiverName(first, list))
                        .receiverPhone(getReceiverPhone(first, list))
                        .receiverAddress(null)
                        .build();
                order = orderRepository.save(order);
            } else {
                if (summary != null && summary.getProductOrderStatus() != null) {
                    order.setOrderStatus(summary.getProductOrderStatus());
                }
                orderRepository.save(order);
            }

            Shipping shipping = shippingRepository.findByOrder_Uid(order.getUid()).orElse(null);
            if (shipping == null) {
                shipping = new Shipping();
                shipping.setOrder(order);
            }
            if (deliveryInfo != null) {
                shipping.setShippingStatus(mapDeliveryStatus(deliveryInfo.getDeliveryStatus()));
                shipping.setCarrier(deliveryInfo.getDeliveryCompany());
                shipping.setTrackingNo(deliveryInfo.getTrackingNumber());
                shipping.setShippedAt(parseInstant(deliveryInfo.getSendDate()));
                shipping.setDeliveredAt(parseInstant(deliveryInfo.getDeliveredDate()));
            } else {
                if (shipping.getShippingStatus() == null) {
                    shipping.setShippingStatus("PENDING");
                }
            }
            shippingRepository.save(shipping);
        }
        log.info("배송 동기화 완료 storeUid={} orders={}", storeUid, byOrderId.size());
    }

    private String getReceiverName(NaverProductOrderDetail first, List<NaverProductOrderDetail> list) {
        for (NaverProductOrderDetail d : list) {
            if (d.getProductOrder() != null && d.getProductOrder().getShippingAddress() != null
                    && d.getProductOrder().getShippingAddress().getName() != null) {
                return d.getProductOrder().getShippingAddress().getName();
            }
        }
        return first.getOrder() != null ? first.getOrder().getOrdererName() : null;
    }

    private String getReceiverPhone(NaverProductOrderDetail first, List<NaverProductOrderDetail> list) {
        for (NaverProductOrderDetail d : list) {
            if (d.getProductOrder() != null && d.getProductOrder().getShippingAddress() != null) {
                String tel = d.getProductOrder().getShippingAddress().getTel1();
                if (tel != null) return tel;
            }
        }
        return first.getOrder() != null ? first.getOrder().getOrdererTel() : null;
    }

    private String mapDeliveryStatus(String deliveryStatus) {
        if (deliveryStatus == null || deliveryStatus.isBlank()) return "PENDING";
        switch (deliveryStatus.toUpperCase()) {
            case "READY":
            case "DELIVERY_READY":
                return "READY";
            case "DELIVERING":
            case "IN_TRANSIT":
                return "IN_TRANSIT";
            case "DELIVERED":
            case "DELIVERY_COMPLETE":
                return "DELIVERED";
            default:
                return deliveryStatus;
        }
    }

    private Instant parseInstant(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return ZonedDateTime.parse(dateStr, NAVER_DATETIME).toInstant();
        } catch (Exception e) {
            try {
                return Instant.parse(dateStr);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private ShippingListItem toListItem(Shipping s) {
        Order o = s.getOrder();
        String storeName = o.getStore() != null ? o.getStore().getName() : "";
        String statusDisplay = toDisplayStatus(s.getShippingStatus());
        return ShippingListItem.builder()
                .orderId(o.getMallOrderNo())
                .storeName(storeName)
                .receiverName(o.getReceiverName() != null ? o.getReceiverName() : o.getBuyerName())
                .status(statusDisplay)
                .invoice(s.getTrackingNo() != null ? (s.getCarrier() != null ? s.getCarrier() + " " : "") + s.getTrackingNo() : "-")
                .orderDate(o.getOrderDate())
                .build();
    }

    private String toDisplayStatus(String status) {
        if (status == null) return "출고대기";
        switch (status.toUpperCase()) {
            case "PENDING":
            case "READY":
                return "출고대기";
            case "IN_TRANSIT":
            case "DELIVERING":
                return "배송중";
            case "DELIVERED":
                return "배송완료";
            default:
                return status;
        }
    }

    /** status: pending, shipping, done 또는 내부값(PENDING, IN_TRANSIT, DELIVERED 등) */
    private Page<Shipping> resolveStatusFilter(Long storeUid, String status, Pageable pageable) {
        if (status == null || status.isBlank()) {
            return shippingRepository.findByOrder_Store_UidOrderByOrder_OrderDateDesc(storeUid, pageable);
        }
        String lower = status.toLowerCase();
        if ("pending".equals(lower) || "출고대기".equals(status)) {
            return shippingRepository.findByOrder_Store_UidAndShippingStatusInOrderByOrder_OrderDateDesc(
                    storeUid, Arrays.asList("PENDING", "READY"), pageable);
        }
        if ("shipping".equals(lower) || "배송중".equals(status)) {
            return shippingRepository.findByOrder_Store_UidAndShippingStatusOrderByOrder_OrderDateDesc(
                    storeUid, "IN_TRANSIT", pageable);
        }
        if ("done".equals(lower) || "배송완료".equals(status)) {
            return shippingRepository.findByOrder_Store_UidAndShippingStatusOrderByOrder_OrderDateDesc(
                    storeUid, "DELIVERED", pageable);
        }
        return shippingRepository.findByOrder_Store_UidAndShippingStatusOrderByOrder_OrderDateDesc(storeUid, status, pageable);
    }

    private void ensureMyStore(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (user.getCompany() == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(user.getCompany().getUid())) {
            throw new IllegalArgumentException("해당 스토어의 배송을 조회할 권한이 없습니다.");
        }
    }
}
