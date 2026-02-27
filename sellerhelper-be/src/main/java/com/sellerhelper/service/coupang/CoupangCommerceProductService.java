package com.sellerhelper.service.coupang;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreAuthRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 쿠팡 Open API - 상품 목록 조회.
 * HMAC 서명으로 요청 인증 (토큰 발급/재발급 없음, 요청마다 서명).
 * @see https://developers.coupangcorp.com
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoupangCommerceProductService {

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final RestTemplate restTemplate;

    /**
     * 쿠팡 스토어 상품 목록 조회 (페이징).
     * DB에 저장된 Access Key / Secret Key로 HMAC 서명 후 API 호출.
     */
    @Transactional(readOnly = true)
    public NaverProductSearchResult getProductList(Long storeUid, int page, int size) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"COUPANG".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("쿠팡 스토어만 상품목록 조회가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        if (auth.getApiKey() == null || auth.getApiKey().isBlank()
                || auth.getApiSecret() == null || auth.getApiSecret().isBlank()) {
            throw new IllegalArgumentException("쿠팡 API Key와 Secret Key를 입력한 뒤 연동 테스트를 완료해 주세요.");
        }
        String vendorId = store.getMallSellerId();
        if (vendorId == null || vendorId.isBlank()) {
            throw new IllegalArgumentException("쿠팡 상품 목록 조회를 위해 스토어에 업체코드(Vendor ID)를 입력해 주세요. 쿠팡 WING 판매자센터에서 확인할 수 있습니다.");
        }
        vendorId = vendorId.trim();

        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, size));
        String path = CoupangApiConstants.PATH_SELLER_PRODUCTS;
        String query = "vendorId=" + vendorId + "&maxPerPage=" + safeSize;
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                auth.getApiKey().trim(), auth.getApiSecret().trim(), "GET", path, query);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Content-Type", "application/json;charset=UTF-8");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        String url = CoupangApiConstants.BASE_URL + path + "?" + query;
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<CoupangProductListResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, CoupangProductListResponse.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("쿠팡 상품목록 조회 실패 storeUid={}, status={}", storeUid, response.getStatusCode());
                return NaverProductSearchResult.empty(page, safeSize);
            }

            CoupangProductListResponse body = response.getBody();
            if (body == null) {
                return NaverProductSearchResult.empty(safePage, safeSize);
            }
            List<NaverProductItem> items = body.getData() == null
                    ? Collections.emptyList()
                    : body.getData().stream().map(this::toProductItem).collect(Collectors.toList());
            int totalCount = body.getTotalCount() != null ? body.getTotalCount() : items.size();

            return NaverProductSearchResult.builder()
                    .contents(items)
                    .page(safePage)
                    .size(safeSize)
                    .totalCount(totalCount)
                    .build();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String safeMessage = buildSafeApiErrorMessage(e, "상품목록 조회");
            log.warn("쿠팡 상품목록 조회 실패 storeUid={}, status={}, body(utf8)={}", storeUid, e.getStatusCode(), readBodyUtf8(e));
            throw new IllegalStateException(safeMessage);
        } catch (Exception e) {
            log.warn("쿠팡 상품목록 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품목록 조회에 실패했습니다. " + (e.getMessage() != null && isCleanUtf8(e.getMessage()) ? e.getMessage() : "잠시 후 다시 시도하세요."));
        }
    }

    /** 외부 API 응답 본문을 UTF-8로 읽기 (인코딩 깨짐 방지) */
    private static String readBodyUtf8(org.springframework.web.client.HttpClientErrorException e) {
        try {
            byte[] body = e.getResponseBodyAsByteArray();
            if (body == null || body.length == 0) return "";
            return new String(body, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return "(body 읽기 실패)";
        }
    }

    /** 사용자에게 보여줄 오류 메시지 (응답 본문 인코딩 깨짐 없이) */
    private static String buildSafeApiErrorMessage(org.springframework.web.client.HttpClientErrorException e, String action) {
        int status = e.getStatusCode() != null ? e.getStatusCode().value() : 0;
        if (status == 403) return action + "에 실패했습니다. (403 접근 거부 - 쿠팡 API 키·시크릿·IP 화이트리스트를 확인하세요.)";
        if (status == 401) return action + "에 실패했습니다. (401 인증 실패 - API 키·시크릿을 확인하세요.)";
        if (status == 404) return action + "에 실패했습니다. (404 리소스를 찾을 수 없습니다.)";
        return action + "에 실패했습니다. (HTTP " + status + " - 쿠팡 API 키·IP를 확인하세요.)";
    }

    private static boolean isCleanUtf8(String s) {
        if (s == null || s.isEmpty()) return true;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '?' && i + 1 < s.length() && s.charAt(i + 1) == '�') return false;
            if (Character.isSurrogate(c)) return false;
        }
        return true;
    }

    /**
     * 쿠팡 상품 단건 조회 (sellerProductId 기준).
     * GET /v2/.../seller-products/{sellerProductId}
     */
    @Transactional(readOnly = true)
    public NaverProductItem getProduct(Long storeUid, String sellerProductId) {
        if (sellerProductId == null || sellerProductId.isBlank()) {
            throw new IllegalArgumentException("상품 ID(sellerProductId)가 필요합니다.");
        }
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"COUPANG".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("쿠팡 스토어만 상품 단건 조회가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        if (auth.getApiKey() == null || auth.getApiKey().isBlank()
                || auth.getApiSecret() == null || auth.getApiSecret().isBlank()) {
            throw new IllegalArgumentException("쿠팡 API Key와 Secret Key를 입력한 뒤 연동 테스트를 완료해 주세요.");
        }

        String path = CoupangApiConstants.PATH_SELLER_PRODUCTS + "/" + sellerProductId.trim();
        String query = "";
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                auth.getApiKey().trim(), auth.getApiSecret().trim(), "GET", path, query);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Content-Type", "application/json;charset=UTF-8");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        String url = CoupangApiConstants.BASE_URL + path;
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<CoupangProductDetailResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, CoupangProductDetailResponse.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("쿠팡 상품 단건 조회 실패 storeUid={}, sellerProductId={}, status={}",
                        storeUid, sellerProductId, response.getStatusCode());
                return null;
            }
            CoupangProductDetailResponse body = response.getBody();
            if (body == null || body.getData() == null) {
                return null;
            }
            return toProductItem(body.getData());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String safeMessage = buildSafeApiErrorMessage(e, "상품 조회");
            log.warn("쿠팡 상품 단건 조회 실패 storeUid={}, sellerProductId={}, status={}, body(utf8)={}", storeUid, sellerProductId, e.getStatusCode(), readBodyUtf8(e));
            throw new IllegalStateException(safeMessage);
        } catch (Exception e) {
            log.warn("쿠팡 상품 단건 조회 실패 storeUid={}, sellerProductId={}: {}", storeUid, sellerProductId, e.getMessage());
            throw new IllegalStateException("상품 조회에 실패했습니다. " + (e.getMessage() != null && isCleanUtf8(e.getMessage()) ? e.getMessage() : "잠시 후 다시 시도하세요."));
        }
    }

    private NaverProductItem toProductItem(CoupangProductListItem p) {
        if (p == null) return NaverProductItem.empty();
        String productId = p.getSellerProductId() != null ? String.valueOf(p.getSellerProductId()) : null;
        String statusName = p.getStatusName() != null ? p.getStatusName() : p.getSaleStatus();
        String statusType = normalizeCoupangStatus(statusName);
        Long salePrice = resolveSalePrice(p);
        Integer stockQuantity = resolveStockQuantity(p);
        return NaverProductItem.builder()
                .channelProductNo(productId)
                .productName(p.getSellerProductName())
                .salePrice(salePrice)
                .stockQuantity(stockQuantity)
                .statusType(statusType != null ? statusType : statusName)
                .representativeImageUrl(p.getImageUrl())
                .leafCategoryId(p.getCategoryId())
                .build();
    }

    /** 상품 가격: 최상위 salePrice → items[].salePrice → originalPrice 순으로 사용 (쿠팡 상품 조회 문서) */
    private Long resolveSalePrice(CoupangProductListItem p) {
        if (p.getSalePrice() != null) return p.getSalePrice();
        if (p.getItems() != null && !p.getItems().isEmpty()) {
            for (CoupangProductItemOption opt : p.getItems()) {
                if (opt.getSalePrice() != null) return opt.getSalePrice();
            }
        }
        if (p.getOriginalPrice() != null) return p.getOriginalPrice();
        return null;
    }

    /** 재고: 최상위 stockQuantity 없으면 items[].quantity 합계 (쿠팡 상품 조회 문서 구조) */
    private Integer resolveStockQuantity(CoupangProductListItem p) {
        if (p.getStockQuantity() != null) return p.getStockQuantity();
        if (p.getItems() != null && !p.getItems().isEmpty()) {
            int sum = 0;
            for (CoupangProductItemOption opt : p.getItems()) {
                if (opt.getQuantity() != null) sum += opt.getQuantity();
            }
            return sum > 0 ? sum : null;
        }
        return null;
    }

    /** 쿠팡 statusName(승인완료 등) → 프론트 배지용 SALE/OUTOFSTOCK/SUSPENSION */
    private String normalizeCoupangStatus(String statusName) {
        if (statusName == null || statusName.isEmpty()) return null;
        String s = statusName.trim();
        if (s.contains("승인") || "APPROVED".equalsIgnoreCase(s) || "SALE".equalsIgnoreCase(s)) return "SALE";
        if (s.contains("품절") || "OUTOFSTOCK".equalsIgnoreCase(s) || "OUT_OF_STOCK".equalsIgnoreCase(s)) return "OUTOFSTOCK";
        if (s.contains("중지") || "SUSPENSION".equalsIgnoreCase(s)) return "SUSPENSION";
        return null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CoupangProductListResponse {
        @JsonProperty("data")
        @JsonAlias("content")
        private List<CoupangProductListItem> data;
        @JsonProperty("totalCount")
        private Integer totalCount;
        @JsonProperty("nextToken")
        private String nextToken;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CoupangProductListItem {
        @JsonProperty("sellerProductId")
        @JsonAlias({"seller_product_id"})
        private Long sellerProductId;
        @JsonProperty("sellerProductName")
        @JsonAlias({"seller_product_name"})
        private String sellerProductName;
        @JsonProperty("salePrice")
        @JsonAlias({"sale_price", "sellingPrice", "selling_price"})
        private Long salePrice;
        @JsonProperty("stockQuantity")
        @JsonAlias({"stock_quantity", "quantity", "stockQuantity"})
        private Integer stockQuantity;
        @JsonProperty("saleStatus")
        @JsonAlias({"sale_status"})
        private String saleStatus;
        @JsonProperty("statusName")
        @JsonAlias({"status_name", "status"})
        private String statusName;
        @JsonProperty("imageUrl")
        @JsonAlias({"image_url", "representativeImageUrl", "thumbnailUrl", "mainImageUrl"})
        private String imageUrl;
        @JsonProperty("categoryId")
        @JsonAlias({"category_id"})
        private String categoryId;
        @JsonProperty("createdAt")
        @JsonAlias({"created_at"})
        private String createdAt;
        @JsonProperty("originalPrice")
        @JsonAlias({"original_price"})
        private Long originalPrice;
        /** 옵션 목록 (상품 조회 문서: 가격/재고가 items 안에 있는 경우) */
        @JsonProperty("items")
        private List<CoupangProductItemOption> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CoupangProductItemOption {
        @JsonProperty("salePrice")
        @JsonAlias({"sale_price"})
        private Long salePrice;
        @JsonProperty("originalPrice")
        @JsonAlias({"original_price"})
        private Long originalPrice;
        @JsonProperty("quantity")
        @JsonAlias({"stock_quantity", "stockQuantity"})
        private Integer quantity;
        @JsonProperty("vendorItemId")
        @JsonAlias({"vendor_item_id"})
        private Long vendorItemId;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CoupangProductDetailResponse {
        @JsonProperty("data")
        private CoupangProductListItem data;
    }
}
