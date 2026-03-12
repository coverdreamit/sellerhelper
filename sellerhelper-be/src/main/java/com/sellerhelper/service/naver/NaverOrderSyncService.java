package com.sellerhelper.service.naver;

import com.sellerhelper.dto.naver.*;
import com.sellerhelper.entity.Order;
import com.sellerhelper.entity.OrderItem;
import com.sellerhelper.entity.Store;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.OrderItemRepository;
import com.sellerhelper.repository.OrderRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 네이버 스마트스토어 주문 API → DB 동기화
 * last-changed API로 변경된 상품주문 ID 수집 후 상세 조회하여 Order/OrderItem 저장
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverOrderSyncService {

    private static final DateTimeFormatter NAVER_DATETIME = DateTimeFormatter.ISO_DATE_TIME;

    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final NaverCommerceOrderService naverCommerceOrderService;

    /**
     * 해당 스토어의 최근 변경 주문을 네이버 API에서 가져와 DB에 저장(갱신)
     * @param storeUid 스토어 UID
     * @param lastChangedFrom 조회 시작 일시 (예: 24시간 전)
     */
    @Transactional
    public int syncOrdersFromNaver(Long storeUid, ZonedDateTime lastChangedFrom) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 주문 동기화가 가능합니다.");
        }

        List<String> allProductOrderIds = new ArrayList<>();
        ZonedDateTime lastChangedTo = null;
        Integer moreSequence = null;

        do {
            NaverLastChangedResult result = naverCommerceOrderService.getLastChangedProductOrders(
                    storeUid, lastChangedFrom, lastChangedTo, 300, moreSequence);
            if (result.getData() != null) {
                result.getData().stream()
                        .map(NaverLastChangedItem::getProductOrderId)
                        .filter(id -> id != null && !id.isEmpty())
                        .forEach(allProductOrderIds::add);
            }
            if (result.getMore() == null || result.getMore().getMoreSequence() == null) {
                break;
            }
            moreSequence = result.getMore().getMoreSequence();
            if (result.getMore().getMoreFrom() != null) {
                try {
                    lastChangedFrom = ZonedDateTime.parse(result.getMore().getMoreFrom(), NAVER_DATETIME);
                } catch (Exception e) {
                    break;
                }
            }
        } while (moreSequence != null);

        if (allProductOrderIds.isEmpty()) {
            return 0;
        }

        int saved = 0;
        for (int i = 0; i < allProductOrderIds.size(); i += 300) {
            int end = Math.min(i + 300, allProductOrderIds.size());
            List<String> batch = allProductOrderIds.subList(i, end);
            List<NaverProductOrderDetail> details = naverCommerceOrderService.getProductOrderDetails(storeUid, batch);
            for (NaverProductOrderDetail d : details) {
                try {
                    saveOrUpdateOrderAndItem(store, d);
                    saved++;
                } catch (Exception e) {
                    log.warn("주문 저장 실패 orderId={} productOrderId={}: {}",
                            d.getOrder() != null ? d.getOrder().getOrderId() : null,
                            d.getProductOrder() != null ? d.getProductOrder().getProductOrderId() : null,
                            e.getMessage());
                }
            }
        }
        return saved;
    }

    private void saveOrUpdateOrderAndItem(Store store, NaverProductOrderDetail d) {
        NaverOrderInfo orderInfo = d.getOrder();
        NaverProductOrderSummary productOrder = d.getProductOrder();
        if (orderInfo == null || productOrder == null) return;

        String orderId = orderInfo.getOrderId();
        String productOrderId = productOrder.getProductOrderId();
        if (orderId == null || productOrderId == null) return;

        Order order = orderRepository.findByStore_UidAndMallOrderNo(store.getUid(), orderId)
                .orElseGet(() -> {
                    Order newOrder = new Order();
                    newOrder.setStore(store);
                    newOrder.setMallOrderNo(orderId);
                    return newOrder;
                });

        Instant orderDate = parseInstant(orderInfo.getOrderDate());
        if (orderDate != null) order.setOrderDate(orderDate);
        order.setOrderStatus(productOrder.getProductOrderStatus());
        order.setBuyerName(orderInfo.getOrdererName());
        order.setBuyerPhone(orderInfo.getOrdererTel());
        if (productOrder.getShippingAddress() != null) {
            order.setReceiverName(productOrder.getShippingAddress().getName());
            order.setReceiverPhone(concatTel(productOrder.getShippingAddress()));
            order.setReceiverAddress(formatAddress(productOrder.getShippingAddress()));
        }
        if (productOrder.getTotalPaymentAmount() != null) {
            order.setTotalAmount(BigDecimal.valueOf(productOrder.getTotalPaymentAmount()));
        }
        Order savedOrder = orderRepository.save(order);

        OrderItem item = orderItemRepository.findByOrder_UidAndMallItemId(savedOrder.getUid(), productOrderId)
                .orElseGet(() -> {
                    OrderItem newItem = new OrderItem();
                    newItem.setOrder(savedOrder);
                    newItem.setMallItemId(productOrderId);
                    return newItem;
                });
        item.setProductName(productOrder.getProductName() != null ? productOrder.getProductName() : "");
        item.setOptionInfo(productOrder.getProductOption());
        item.setQuantity(productOrder.getQuantity() != null ? productOrder.getQuantity() : 1);
        if (productOrder.getUnitPrice() != null) {
            item.setUnitPrice(BigDecimal.valueOf(productOrder.getUnitPrice()));
        }
        if (productOrder.getTotalPaymentAmount() != null) {
            item.setTotalPrice(BigDecimal.valueOf(productOrder.getTotalPaymentAmount()));
        }
        item.setProductOrderStatus(productOrder.getProductOrderStatus());
        orderItemRepository.save(item);
    }

    private static Instant parseInstant(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return ZonedDateTime.parse(dateStr, NAVER_DATETIME).toInstant();
        } catch (Exception e) {
            return null;
        }
    }

    private static String concatTel(NaverOrderAddress addr) {
        if (addr == null) return null;
        String t1 = addr.getTel1();
        String t2 = addr.getTel2();
        if (t1 != null && t2 != null) return t1 + " " + t2;
        return t1 != null ? t1 : t2;
    }

    private static String formatAddress(NaverOrderAddress addr) {
        if (addr == null) return null;
        StringBuilder sb = new StringBuilder();
        if (addr.getZipCode() != null) sb.append("[").append(addr.getZipCode()).append("] ");
        if (addr.getBaseAddress() != null) sb.append(addr.getBaseAddress());
        if (addr.getDetailedAddress() != null) sb.append(" ").append(addr.getDetailedAddress());
        return sb.length() > 0 ? sb.toString() : null;
    }
}
