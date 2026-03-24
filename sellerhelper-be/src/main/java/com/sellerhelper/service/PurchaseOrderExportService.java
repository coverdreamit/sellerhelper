package com.sellerhelper.service;

import com.sellerhelper.dto.order.PurchaseOrderExportRequest;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Order;
import com.sellerhelper.entity.OrderItem;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.OrderItemRepository;
import com.sellerhelper.repository.OrderRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 배송(주문) 목록에서 선택한 주문을 발주업체 양식 컬럼에 맞춰 xlsx로 내보냅니다.
 * DB에 동기화된 주문·상품행 기준 (스마트스토어 엑셀과 동일 필드 의미).
 */
@Service
@RequiredArgsConstructor
public class PurchaseOrderExportService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter ORDER_DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(KST);

    private static final Map<String, String> FIELD_LABELS = new LinkedHashMap<>();

    static {
        FIELD_LABELS.put("mallOrderNo", "주문번호");
        FIELD_LABELS.put("productOrderNo", "상품주문번호");
        FIELD_LABELS.put("orderDate", "주문일시");
        FIELD_LABELS.put("orderStatus", "주문상태");
        FIELD_LABELS.put("storeName", "스토어명");
        FIELD_LABELS.put("buyerName", "구매자명");
        FIELD_LABELS.put("buyerPhone", "구매자연락처");
        FIELD_LABELS.put("receiverName", "수령인명");
        FIELD_LABELS.put("receiverPhone", "수령인연락처");
        FIELD_LABELS.put("receiverAddress", "배송지");
        FIELD_LABELS.put("productName", "상품명");
        FIELD_LABELS.put("optionInfo", "옵션정보");
        FIELD_LABELS.put("quantity", "수량");
        FIELD_LABELS.put("unitPrice", "판매단가");
        FIELD_LABELS.put("totalPrice", "상품주문금액");
        FIELD_LABELS.put("productOrderStatus", "상품주문상태");
        FIELD_LABELS.put("supplyPrice", "공급가(입력)");
        FIELD_LABELS.put("remark", "비고");
    }

    private static final Set<String> KNOWN_KEYS = FIELD_LABELS.keySet();

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public byte[] exportExcel(Long userUid, Long storeUid, PurchaseOrderExportRequest request) {
        ensureMyStore(userUid, storeUid);
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(request.getVendorId(), userUid)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", request.getVendorId()));

        List<String> columnKeys = request.getColumnKeys().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .filter(KNOWN_KEYS::contains)
                .collect(Collectors.toList());
        if (columnKeys.isEmpty()) {
            throw new IllegalArgumentException("유효한 컬럼이 없습니다.");
        }

        List<Long> orderUids = request.getOrderUids();
        if (orderUids == null || orderUids.isEmpty()) {
            throw new IllegalArgumentException("선택된 주문이 없습니다.");
        }

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("발주서");
            int rowIdx = 0;
            Row meta = sheet.createRow(rowIdx++);
            Cell c0 = meta.createCell(0);
            c0.setCellValue("발주업체: " + vendor.getVendorName());

            Row header = sheet.createRow(rowIdx++);
            for (int i = 0; i < columnKeys.size(); i++) {
                String key = columnKeys.get(i);
                header.createCell(i).setCellValue(FIELD_LABELS.getOrDefault(key, key));
            }

            for (Long orderUid : orderUids) {
                Order order = orderRepository.findByUidAndStore_Uid(orderUid, storeUid).orElse(null);
                if (order == null) {
                    continue;
                }
                String storeName = order.getStore() != null ? order.getStore().getName() : "";
                List<OrderItem> items = orderItemRepository.findByOrder_Uid(order.getUid());
                for (OrderItem item : items) {
                    Row dataRow = sheet.createRow(rowIdx++);
                    for (int col = 0; col < columnKeys.size(); col++) {
                        Object val = resolveField(columnKeys.get(col), order, item, storeName);
                        setCell(dataRow.createCell(col), val);
                    }
                }
            }

            for (int i = 0; i < columnKeys.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            wb.write(bos);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("엑셀 생성 실패: " + e.getMessage(), e);
        }
    }

    private void setCell(Cell cell, Object val) {
        if (val == null) {
            cell.setBlank();
            return;
        }
        if (val instanceof Number) {
            if (val instanceof BigDecimal) {
                cell.setCellValue(((BigDecimal) val).doubleValue());
            } else {
                cell.setCellValue(((Number) val).doubleValue());
            }
            return;
        }
        cell.setCellValue(val.toString());
    }

    private Object resolveField(String key, Order order, OrderItem item, String storeName) {
        switch (key) {
            case "mallOrderNo":
                return n(order.getMallOrderNo());
            case "productOrderNo":
                return n(item.getMallItemId());
            case "orderDate":
                return formatInstant(order.getOrderDate());
            case "orderStatus":
                return humanOrderStatus(order.getOrderStatus());
            case "storeName":
                return n(storeName);
            case "buyerName":
                return n(order.getBuyerName());
            case "buyerPhone":
                return n(order.getBuyerPhone());
            case "receiverName":
                return n(order.getReceiverName());
            case "receiverPhone":
                return n(order.getReceiverPhone());
            case "receiverAddress":
                return n(order.getReceiverAddress());
            case "productName":
                return n(item.getProductName());
            case "optionInfo":
                return n(item.getOptionInfo());
            case "quantity":
                return item.getQuantity() != null ? item.getQuantity() : "";
            case "unitPrice":
                return item.getUnitPrice();
            case "totalPrice":
                return item.getTotalPrice();
            case "productOrderStatus":
                return humanProductOrderStatus(item.getProductOrderStatus());
            case "supplyPrice":
                return "";
            case "remark":
                return "";
            default:
                return "";
        }
    }

    private static String n(String s) {
        return s != null ? s : "";
    }

    private String formatInstant(Instant instant) {
        if (instant == null) {
            return "";
        }
        return ORDER_DT.format(instant);
    }

    private String humanOrderStatus(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        switch (code) {
            case "PAYED":
                return "결제완료";
            case "DELIVERING":
                return "배송중";
            case "DELIVERED":
                return "배송완료";
            case "CANCELED":
            case "CANCELLED":
                return "취소";
            default:
                return code;
        }
    }

    private String humanProductOrderStatus(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        switch (code) {
            case "PAYED":
                return "결제완료";
            case "DELIVERING":
                return "배송중";
            case "DELIVERED":
                return "배송완료";
            default:
                return code;
        }
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
}
