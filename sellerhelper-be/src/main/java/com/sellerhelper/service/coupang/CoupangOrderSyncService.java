package com.sellerhelper.service.coupang;

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
import java.time.LocalDate;
import java.util.List;

/**
 * 쿠팡 RG Order API 응답 → DB 동기화 (Order, OrderItem 저장/갱신).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoupangOrderSyncService {

    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CoupangCommerceOrderService coupangCommerceOrderService;

    /**
     * 결제일 기준 기간으로 쿠팡 주문 API 조회 후 DB에 저장/갱신.
     *
     * @param storeUid 스토어 UID
     * @param dateFrom 조회 시작일
     * @param dateTo   조회 종료일
     * @return 저장(갱신)된 주문 건수 (Order 기준)
     */
    @Transactional
    public int syncOrdersFromCoupang(Long storeUid, LocalDate dateFrom, LocalDate dateTo) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (store.getMall() == null || !"COUPANG".equalsIgnoreCase(store.getMall().getCode())) {
            throw new IllegalArgumentException("쿠팡 스토어만 주문 동기화가 가능합니다.");
        }

        List<CoupangCommerceOrderService.RgOrderDto> orders = coupangCommerceOrderService.fetchRgOrders(storeUid, dateFrom, dateTo);
        int saved = 0;
        for (CoupangCommerceOrderService.RgOrderDto dto : orders) {
            try {
                saveOrUpdateOrderAndItems(store, dto);
                saved++;
            } catch (Exception e) {
                log.warn("쿠팡 주문 저장 실패 orderId={}: {}", dto.getOrderId(), e.getMessage());
            }
        }
        return saved;
    }

    private void saveOrUpdateOrderAndItems(Store store, CoupangCommerceOrderService.RgOrderDto dto) {
        if (dto.getOrderId() == null) return;
        String mallOrderNo = String.valueOf(dto.getOrderId());

        Order order = orderRepository.findByStore_UidAndMallOrderNo(store.getUid(), mallOrderNo)
                .orElseGet(() -> {
                    Order newOrder = new Order();
                    newOrder.setStore(store);
                    newOrder.setMallOrderNo(mallOrderNo);
                    return newOrder;
                });

        Instant orderDate = parsePaidAt(dto.getPaidAt());
        if (orderDate != null) order.setOrderDate(orderDate);
        order.setOrderStatus("PAID");
        order.setBuyerName(null);
        order.setBuyerPhone(null);
        order.setReceiverName(null);
        order.setReceiverPhone(null);
        order.setReceiverAddress(null);

        BigDecimal totalAmount = BigDecimal.ZERO;
        if (dto.getOrderItems() != null) {
            for (CoupangCommerceOrderService.RgOrderItemDto itemDto : dto.getOrderItems()) {
                int qty = itemDto.getSalesQuantity() != null ? itemDto.getSalesQuantity() : 1;
                long unit = itemDto.getUnitSalesPrice() != null ? itemDto.getUnitSalesPrice() : 0L;
                BigDecimal itemTotal = BigDecimal.valueOf(unit).multiply(BigDecimal.valueOf(qty));
                totalAmount = totalAmount.add(itemTotal);
            }
        }
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        if (dto.getOrderItems() != null) {
            for (CoupangCommerceOrderService.RgOrderItemDto itemDto : dto.getOrderItems()) {
                String mallItemId = itemDto.getVendorItemId() != null ? String.valueOf(itemDto.getVendorItemId()) : null;
                if (mallItemId == null) continue;

                OrderItem item = orderItemRepository.findByOrder_UidAndMallItemId(savedOrder.getUid(), mallItemId)
                        .orElseGet(() -> {
                            OrderItem newItem = new OrderItem();
                            newItem.setOrder(savedOrder);
                            newItem.setMallItemId(mallItemId);
                            return newItem;
                        });

                item.setProductName(itemDto.getProductName() != null ? itemDto.getProductName() : "");
                item.setOptionInfo(null);
                item.setChannelType("COUPANG");
                item.setExternalProductId(itemDto.getVendorItemId() != null ? String.valueOf(itemDto.getVendorItemId()) : null);
                item.setExternalOptionId(null);
                item.setSellerSku(null);
                item.setQuantity(itemDto.getSalesQuantity() != null ? itemDto.getSalesQuantity() : 1);
                if (itemDto.getUnitSalesPrice() != null) {
                    item.setUnitPrice(BigDecimal.valueOf(itemDto.getUnitSalesPrice()));
                }
                int qty = item.getQuantity();
                if (itemDto.getUnitSalesPrice() != null) {
                    item.setTotalPrice(BigDecimal.valueOf(itemDto.getUnitSalesPrice()).multiply(BigDecimal.valueOf(qty)));
                }
                item.setProductOrderStatus("PAID");
                orderItemRepository.save(item);
            }
        }
    }

    private static Instant parsePaidAt(String paidAt) {
        if (paidAt == null || paidAt.isBlank()) return null;
        try {
            long ms = Long.parseLong(paidAt.trim());
            return Instant.ofEpochMilli(ms);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
