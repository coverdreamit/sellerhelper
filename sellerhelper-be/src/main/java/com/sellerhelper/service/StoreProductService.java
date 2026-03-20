package com.sellerhelper.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreProduct;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreProductRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.service.coupang.CoupangProductQueryService;
import com.sellerhelper.service.coupang.CoupangProductSyncService;
import com.sellerhelper.service.naver.NaverCommerceProductService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** 스토어별 상품목록 조회. 모든 플랫폼(네이버/쿠팡 등) 공통으로 DB 저장분 조회. */
@Service
@RequiredArgsConstructor
public class StoreProductService {
    private static final DateTimeFormatter EXPORT_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").withZone(ZoneId.of("Asia/Seoul"));
    private static final Map<String, String> EXCEL_COLUMN_LABEL_MAP = buildExcelColumnLabelMap();

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final StoreProductRepository storeProductRepository;
    private final NaverCommerceProductService naverProductService;
    private final CoupangProductSyncService coupangProductSyncService;
    private final CoupangProductQueryService coupangProductQueryService;
    private final ObjectMapper objectMapper;

    /**
     * 내 스토어 상품목록 조회 (본인 회사 스토어만).
     * 모든 플랫폼 공통: DB 저장분 페이징 조회. 동기화 미실행 시 빈 목록.
     */
    @Transactional(readOnly = true)
    public NaverProductSearchResult getMyStoreProducts(Long userUid, Long storeUid, int page, int size) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 조회할 권한이 없습니다.");
        }

        return getStoreProductsFromDb(store, page, size);
    }

    /** 스토어 상품 목록 DB 조회 (페이징, 플랫폼 공통) */
    private NaverProductSearchResult getStoreProductsFromDb(Store store, int page, int size) {
        long storeUid = store.getUid();
        long totalCount = storeProductRepository.countByStore_Uid(storeUid);
        Instant lastSyncedAt = null;
        StoreProduct lastSync = storeProductRepository.findTop1ByStore_UidOrderBySyncedAtDesc(storeUid);
        if (lastSync != null) {
            lastSyncedAt = lastSync.getSyncedAt();
        }
        if (totalCount == 0) {
            return NaverProductSearchResult.builder()
                    .contents(List.of())
                    .page(page)
                    .size(size)
                    .totalCount(0)
                    .lastSyncedAt(lastSyncedAt)
                    .build();
        }
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.max(1, Math.min(100, size)),
                Sort.by("sellerProductId", "vendorItemId"));
        List<NaverProductItem> contents = storeProductRepository
                .findByStore_UidOrderBySellerProductIdAscVendorItemIdAsc(storeUid, pageable)
                .stream()
                .map(this::toNaverProductItem)
                .collect(Collectors.toList());
        return NaverProductSearchResult.builder()
                .contents(contents)
                .page(page)
                .size(size)
                .totalCount((int) totalCount)
                .lastSyncedAt(lastSyncedAt)
                .build();
    }

    private NaverProductItem toNaverProductItem(StoreProduct p) {
        JsonNode raw = readRawPayload(p.getRawPayload());
        JsonNode productNode = extractProductNode(raw);
        return NaverProductItem.builder()
                .channelProductNo(firstNonBlank(
                        readString(raw, "sellerProductId", null),
                        readString(productNode, "channelProductNo", null),
                        p.getSellerProductId()))
                .vendorItemId(readNullableString(raw, "vendorItemId", p.getVendorItemId()))
                .productName(firstNonBlank(
                        readString(raw, "productName", null),
                        readString(productNode, "name", null),
                        readString(productNode, "sellerProductName", null)))
                .optionName(readString(raw, "optionName", null))
                .salePrice(firstNonNull(readLong(raw, "salePrice", null), readLong(productNode, "salePrice", null)))
                .originalPrice(readLong(raw, "originalPrice", null))
                .stockQuantity(firstNonNull(readInteger(raw, "stockQuantity", null), readInteger(productNode, "stockQuantity", null)))
                .statusType(firstNonBlank(
                        readString(raw, "statusType", null),
                        readString(productNode, "statusType", null),
                        p.getStatusType()))
                .representativeImageUrl(firstNonBlank(
                        readString(raw, "imageUrl", null),
                        readString(childNode(productNode, "representativeImage"), "url", null)))
                .leafCategoryId(firstNonBlank(
                        readString(raw, "categoryId", null),
                        readString(productNode, "categoryId", null)))
                .rawPayload(p.getRawPayload())
                .build();
    }

    /**
     * 스토어 상품 목록 동기화: 플랫폼 API에서 전체 조회 후 DB에 반영.
     * 이미 있는 상품은 수정된 항목만 변경, 새 상품은 추가, 채널에서 삭제된 항목은 DB에서 제거.
     * 네이버·쿠팡 지원.
     */
    @Transactional
    public void syncStoreProducts(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findByIdForUpdate(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 동기화할 권한이 없습니다.");
        }
        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if (mallCode == null || mallCode.isBlank()) {
            throw new IllegalArgumentException("스토어의 플랫폼 정보가 없습니다.");
        }
        if ("COUPANG".equalsIgnoreCase(mallCode)) {
            coupangProductSyncService.syncProducts(storeUid);
            return;
        }
        if ("NAVER".equalsIgnoreCase(mallCode)) {
            List<NaverProductItem> items = naverProductService.fetchAllProductsForSync(storeUid);
            Instant syncedAt = Instant.now();
            List<StoreProduct> toSave = items.stream()
                    .map(item -> toStoreProduct(store, item, syncedAt))
                    .collect(Collectors.toList());
            toSave = deduplicateByStoreProductVendor(toSave);

            List<StoreProduct> existingList = storeProductRepository.findAllByStore_Uid(storeUid);
            Map<String, StoreProduct> existingByKey = new LinkedHashMap<>();
            for (StoreProduct p : existingList) {
                String key = productKey(p);
                existingByKey.put(key, p);
            }

            for (StoreProduct incoming : toSave) {
                String key = productKey(incoming);
                StoreProduct existing = existingByKey.get(key);
                if (existing != null) {
                    if (hasChange(existing, incoming)) {
                        applyChange(existing, incoming, syncedAt);
                        storeProductRepository.save(existing);
                    }
                    existingByKey.remove(key);
                } else {
                    storeProductRepository.save(incoming);
                }
            }
            for (StoreProduct removed : existingByKey.values()) {
                storeProductRepository.delete(removed);
            }
            return;
        }
        throw new IllegalArgumentException("해당 플랫폼(" + mallCode + ")은 상품 목록 동기화를 지원하지 않습니다.");
    }

    private static String productKey(StoreProduct p) {
        long storeUid = p.getStore() != null ? p.getStore().getUid() : 0;
        String sid = p.getSellerProductId() != null ? p.getSellerProductId().trim() : "";
        String vid = p.getVendorItemId() != null ? p.getVendorItemId().trim() : "";
        return storeUid + "|" + sid + "|" + vid;
    }

    private boolean hasChange(StoreProduct existing, StoreProduct incoming) {
        return !Objects.equals(existing.getStatusType(), incoming.getStatusType())
                || !Objects.equals(nullToEmpty(existing.getRawPayload()), nullToEmpty(incoming.getRawPayload()));
    }

    private void applyChange(StoreProduct existing, StoreProduct incoming, Instant syncedAt) {
        existing.setStatusType(incoming.getStatusType());
        existing.setRawPayload(incoming.getRawPayload());
        existing.setSyncedAt(syncedAt);
    }

    /** (store_uid, seller_product_id, vendor_item_id) 기준 중복 제거 (마지막 항목 유지). DB 유니크 제약과 동일하게 키 정규화. */
    private List<StoreProduct> deduplicateByStoreProductVendor(List<StoreProduct> list) {
        Map<String, StoreProduct> seen = new LinkedHashMap<>();
        for (StoreProduct p : list) {
            long storeUid = p.getStore() != null ? p.getStore().getUid() : 0;
            String sid = p.getSellerProductId() != null ? p.getSellerProductId().trim() : "";
            String vid = p.getVendorItemId() != null ? p.getVendorItemId().trim() : "";
            String key = storeUid + "|" + sid + "|" + vid;
            seen.put(key, p);
        }
        return new ArrayList<>(seen.values());
    }

    private StoreProduct toStoreProduct(Store store, NaverProductItem item, Instant syncedAt) {
        String vendorItemId = item.getVendorItemId() != null && !item.getVendorItemId().isBlank()
                ? item.getVendorItemId().trim() : "";
        String sellerProductId = item.getChannelProductNo() != null ? item.getChannelProductNo().trim() : "";
        if (sellerProductId.isEmpty()) {
            sellerProductId = "(unknown)";
        }
        return StoreProduct.builder()
                .store(store)
                .sellerProductId(sellerProductId)
                .vendorItemId(vendorItemId)
                .statusType(item.getStatusType())
                .rawPayload(item.getRawPayload() != null ? item.getRawPayload() : "{}")
                .syncedAt(syncedAt)
                .build();
    }

    private JsonNode readRawPayload(String rawPayload) {
        if (rawPayload == null || rawPayload.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(rawPayload);
        } catch (Exception e) {
            return null;
        }
    }

    private static String readString(JsonNode root, String field, String fallback) {
        if (root == null) {
            return fallback;
        }
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return fallback;
        }
        String value = node.asText();
        return value != null ? value : fallback;
    }

    private static String readNullableString(JsonNode root, String field, String fallback) {
        String value = readString(root, field, fallback);
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private static Long readLong(JsonNode root, String field, Long fallback) {
        if (root == null) {
            return fallback;
        }
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return fallback;
        }
        if (node.isNumber()) {
            return node.longValue();
        }
        String text = node.asText(null);
        if (text == null || text.isBlank()) {
            return fallback;
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static Integer readInteger(JsonNode root, String field, Integer fallback) {
        Long longVal = readLong(root, field, null);
        if (longVal != null) {
            return longVal.intValue();
        }
        return fallback;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static JsonNode extractProductNode(JsonNode raw) {
        if (raw == null) {
            return null;
        }
        JsonNode channelProduct = raw.get("channelProduct");
        return (channelProduct != null && !channelProduct.isNull()) ? channelProduct : raw;
    }

    private static JsonNode childNode(JsonNode parent, String field) {
        if (parent == null) {
            return null;
        }
        JsonNode child = parent.get(field);
        return child != null && !child.isNull() ? child : null;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static <T> T firstNonNull(T a, T b) {
        return a != null ? a : b;
    }

    /**
     * 내 스토어 상품 단건 조회 (쿠팡: sellerProductId, 네이버: 미지원 시 null)
     */
    @Transactional(readOnly = true)
    public NaverProductItem getMyStoreProduct(Long userUid, Long storeUid, String productId) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 조회할 권한이 없습니다.");
        }

        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if ("COUPANG".equalsIgnoreCase(mallCode)) {
            try {
                return coupangProductQueryService.getStoredProduct(storeUid, productId, null);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public ExcelExportFile exportMyStoreProductsExcel(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 다운로드할 권한이 없습니다.");
        }

        List<StoreProduct> products = storeProductRepository.findAllByStore_UidOrderBySellerProductIdAscVendorItemIdAsc(storeUid);
        List<Map<String, String>> rows = new ArrayList<>();
        Set<String> keySet = new LinkedHashSet<>();
        for (StoreProduct product : products) {
            Map<String, String> row = buildExportRow(product);
            rows.add(row);
            keySet.addAll(row.keySet());
        }
        List<String> columns = new ArrayList<>(keySet);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("상품목록");

            Row header = sheet.createRow(0);
            for (int c = 0; c < columns.size(); c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(toKoreanExcelColumn(columns.get(c)));
            }

            for (int r = 0; r < rows.size(); r++) {
                Row row = sheet.createRow(r + 1);
                Map<String, String> data = rows.get(r);
                for (int c = 0; c < columns.size(); c++) {
                    String col = columns.get(c);
                    Cell cell = row.createCell(c);
                    cell.setCellValue(data.getOrDefault(col, ""));
                }
            }

            for (int c = 0; c < columns.size(); c++) {
                sheet.setColumnWidth(c, 7000);
            }
            workbook.write(out);
            Instant updatedAt = products.stream()
                    .map(StoreProduct::getSyncedAt)
                    .filter(Objects::nonNull)
                    .max(Instant::compareTo)
                    .orElse(Instant.now());
            String filename = buildExportFilename(store.getName(), updatedAt);
            return new ExcelExportFile(filename, out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("상품목록 엑셀 생성에 실패했습니다.");
        }
    }

    private Map<String, String> buildExportRow(StoreProduct product) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("sellerProductId", nullToEmpty(product.getSellerProductId()));
        row.put("vendorItemId", nullToEmpty(product.getVendorItemId()));
        row.put("statusType", nullToEmpty(product.getStatusType()));
        row.put("syncedAt", product.getSyncedAt() != null ? product.getSyncedAt().toString() : "");
        JsonNode raw = readRawPayload(product.getRawPayload());
        if (raw != null && raw.isObject()) {
            flattenJson("", raw, row);
        } else {
            row.put("rawPayload", nullToEmpty(product.getRawPayload()));
        }
        return row;
    }

    private void flattenJson(String prefix, JsonNode node, Map<String, String> row) {
        if (node == null || node.isNull()) {
            row.put(prefix, "");
            return;
        }
        if (node.isObject()) {
            node.fieldNames().forEachRemaining(field -> {
                String key = prefix.isBlank() ? field : prefix + "." + field;
                flattenJson(key, node.get(field), row);
            });
            return;
        }
        if (node.isArray()) {
            if (node.isEmpty()) {
                row.put(prefix, "[]");
                return;
            }
            for (int i = 0; i < node.size(); i++) {
                String key = prefix + "[" + i + "]";
                flattenJson(key, node.get(i), row);
            }
            return;
        }
        row.put(prefix, node.asText(""));
    }

    private static String buildExportFilename(String storeName, Instant updatedAt) {
        String safeStoreName = sanitizeFilenamePart(storeName);
        String time = EXPORT_TIME_FORMATTER.format(updatedAt);
        return safeStoreName + "_" + time + ".xlsx";
    }

    private static String sanitizeFilenamePart(String value) {
        String base = value == null || value.isBlank() ? "스토어" : value.trim();
        return base.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private static String toKoreanExcelColumn(String key) {
        if (EXCEL_COLUMN_LABEL_MAP.containsKey(key)) {
            return EXCEL_COLUMN_LABEL_MAP.get(key);
        }
        if (key.startsWith("detailPayload.channelProduct.")) {
            String leaf = key.substring("detailPayload.channelProduct.".length());
            return "상세 > 채널상품 > " + toKoreanExcelLeaf(leaf);
        }
        if (key.startsWith("detailPayload.")) {
            String leaf = key.substring("detailPayload.".length());
            return "상세 > " + toKoreanExcelLeaf(leaf);
        }
        if (key.startsWith("channelProduct.")) {
            String leaf = key.substring("channelProduct.".length());
            return "채널상품 > " + toKoreanExcelLeaf(leaf);
        }
        return toKoreanExcelLeaf(key);
    }

    private static String toKoreanExcelLeaf(String key) {
        if (EXCEL_COLUMN_LABEL_MAP.containsKey(key)) {
            return EXCEL_COLUMN_LABEL_MAP.get(key);
        }
        String readable = key.replaceAll("\\[\\d+\\]", "")
                .replaceAll("\\.", " > ")
                .replaceAll("([a-z0-9])([A-Z])", "$1 $2");
        return readable;
    }

    private static Map<String, String> buildExcelColumnLabelMap() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("sellerProductId", "판매자상품ID");
        map.put("vendorItemId", "옵션ID");
        map.put("statusType", "상태");
        map.put("syncedAt", "동기화시각");
        map.put("groupProductNo", "그룹상품번호");
        map.put("originProductNo", "원상품번호");
        map.put("channelProductNo", "채널상품번호");
        map.put("name", "상품명");
        map.put("salePrice", "판매가");
        map.put("originalPrice", "정가");
        map.put("stockQuantity", "재고수량");
        map.put("categoryId", "카테고리ID");
        map.put("statusType", "상태");
        map.put("channelProductDisplayStatusType", "전시상태");
        map.put("modifiedDate", "수정일시");
        map.put("url", "이미지URL");
        map.put("detailPayload.groupProductNo", "상세 > 그룹상품번호");
        map.put("detailPayload.originProductNo", "상세 > 원상품번호");
        map.put("detailPayload.channelProduct.channelProductNo", "상세 > 채널상품 > 채널상품번호");
        map.put("detailPayload.channelProduct.name", "상세 > 채널상품 > 상품명");
        map.put("detailPayload.channelProduct.salePrice", "상세 > 채널상품 > 판매가");
        map.put("detailPayload.channelProduct.stockQuantity", "상세 > 채널상품 > 재고수량");
        map.put("detailPayload.channelProduct.statusType", "상세 > 채널상품 > 상태");
        map.put("detailPayload.channelProduct.channelProductDisplayStatusType", "상세 > 채널상품 > 전시상태");
        map.put("detailPayload.channelProduct.categoryId", "상세 > 채널상품 > 카테고리ID");
        map.put("detailPayload.channelProduct.modifiedDate", "상세 > 채널상품 > 수정일시");
        map.put("detailPayload.channelProduct.representativeImage.url", "상세 > 채널상품 > 대표이미지URL");
        return map;
    }

    public static class ExcelExportFile {
        private final String filename;
        private final byte[] bytes;

        public ExcelExportFile(String filename, byte[] bytes) {
            this.filename = filename;
            this.bytes = bytes;
        }

        public String getFilename() {
            return filename;
        }

        public byte[] getBytes() {
            return bytes;
        }
    }
}
