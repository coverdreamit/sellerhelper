package com.sellerhelper.service.coupang;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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
            log.info("[쿠팡 API] 상품목록 조회 성공 storeUid={}, page={}, size={}, response={}", storeUid, safePage, safeSize, toJson(body));
            List<NaverProductItem> items = body.getData() == null
                    ? Collections.emptyList()
                    : body.getData().stream().flatMap(p -> toProductItems(p).stream()).collect(Collectors.toList());
            enrichPriceAndStockFromDetail(storeUid, items);
            int totalCount = items.size();

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
            throw new IllegalStateException("상품목록 조회에 실패했습니다. " + toUserFriendlyMessage(e));
        }
    }

    /**
     * 쿠팡 상품 전체 조회 (DB 동기화용). nextToken으로 모든 페이지 수집.
     */
    @Transactional(readOnly = true)
    public List<NaverProductItem> fetchAllProductsForSync(Long storeUid) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"COUPANG".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("쿠팡 스토어만 상품 동기화가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        if (auth.getApiKey() == null || auth.getApiKey().isBlank()
                || auth.getApiSecret() == null || auth.getApiSecret().isBlank()) {
            throw new IllegalArgumentException("쿠팡 API Key와 Secret Key를 입력한 뒤 연동 테스트를 완료해 주세요.");
        }
        String vendorId = store.getMallSellerId();
        if (vendorId == null || vendorId.isBlank()) {
            throw new IllegalArgumentException("쿠팡 상품 목록 조회를 위해 스토어에 업체코드(Vendor ID)를 입력해 주세요.");
        }
        vendorId = vendorId.trim();

        List<NaverProductItem> allItems = new ArrayList<>();
        String nextToken = null;
        int maxPerPage = 100;

        try {
            do {
                String path = CoupangApiConstants.PATH_SELLER_PRODUCTS;
                String query = "vendorId=" + vendorId + "&maxPerPage=" + maxPerPage;
                if (nextToken != null && !nextToken.isEmpty()) {
                    query += "&nextToken=" + nextToken;
                }
                String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                        auth.getApiKey().trim(), auth.getApiSecret().trim(), "GET", path, query);

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", authHeader);
                headers.set("Content-Type", "application/json;charset=UTF-8");
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

                String url = CoupangApiConstants.BASE_URL + path + "?" + query;
                ResponseEntity<CoupangProductListResponse> response = restTemplate.exchange(
                        url, HttpMethod.GET, new HttpEntity<>(headers), CoupangProductListResponse.class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    log.warn("쿠팡 상품 동기화 조회 실패 storeUid={}, status={}", storeUid, response.getStatusCode());
                    break;
                }
                CoupangProductListResponse body = response.getBody();
                if (body == null || body.getData() == null || body.getData().isEmpty()) {
                    break;
                }
                log.info("[쿠팡 API] 상품 동기화 페이지 조회 storeUid={}, nextToken={}, pageData={}", storeUid, nextToken, toJson(body));
                List<NaverProductItem> pageItems = body.getData().stream()
                        .flatMap(p -> toProductItems(p).stream())
                        .collect(Collectors.toList());
                enrichPriceAndStockFromDetail(storeUid, pageItems);
                allItems.addAll(pageItems);
                nextToken = body.getNextToken();
            } while (nextToken != null && !nextToken.isEmpty());

            log.info("[쿠팡 API] 상품 동기화 완료 storeUid={}, totalItems={}, allItems={}", storeUid, allItems.size(), toJson(allItems));
            return allItems;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String safeMessage = buildSafeApiErrorMessage(e, "상품 목록 동기화");
            log.warn("쿠팡 상품 동기화 실패 storeUid={}, status={}", storeUid, e.getStatusCode());
            throw new IllegalStateException(safeMessage);
        } catch (Exception e) {
            log.warn("쿠팡 상품 동기화 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품 목록 동기화에 실패했습니다. " + toUserFriendlyMessage(e));
        }
    }

    /** JSON 직렬화 (로그용, 실패 시 toString) */
    private static String toJson(Object obj) {
        if (obj == null) return "null";
        try {
            return OBJECT_MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return obj.toString();
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

    /** 영문 기술 에러 메시지를 사용자 친화적 한글로 변환 */
    private static String toUserFriendlyMessage(Exception e) {
        if (e == null) return "잠시 후 다시 시도하세요.";
        String msg = e.getMessage();
        if (msg == null) msg = "";
        String lower = msg.toLowerCase();
        if (lower.contains("pkix") || lower.contains("certification path") || lower.contains("unable to find valid cert") || lower.contains("sslhandshake") || lower.contains("sun.security.provider.certpath")) {
            return "SSL 인증서 검증에 실패했습니다. Java 신뢰 저장소에 쿠팡 API 인증서가 등록되어 있는지 확인해 주세요.";
        }
        if (lower.contains("connection refused") || lower.contains("connection reset")) {
            return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.";
        }
        if (lower.contains("timeout") || lower.contains("timed out")) {
            return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (isCleanUtf8(msg) && !msg.isBlank()) return msg;
        return "잠시 후 다시 시도하세요.";
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
            log.info("[쿠팡 API] 상품 단건 조회 성공 storeUid={}, sellerProductId={}, response={}", storeUid, sellerProductId, toJson(body));
            return toProductItem(body.getData());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String safeMessage = buildSafeApiErrorMessage(e, "상품 조회");
            log.warn("쿠팡 상품 단건 조회 실패 storeUid={}, sellerProductId={}, status={}, body(utf8)={}", storeUid, sellerProductId, e.getStatusCode(), readBodyUtf8(e));
            throw new IllegalStateException(safeMessage);
        } catch (Exception e) {
            log.warn("쿠팡 상품 단건 조회 실패 storeUid={}, sellerProductId={}: {}", storeUid, sellerProductId, e.getMessage());
            throw new IllegalStateException("상품 조회에 실패했습니다. " + toUserFriendlyMessage(e));
        }
    }

    /** 상품 단건 조회 원본 (옵션 보강·확장용) */
    private CoupangProductListItem fetchProductDetailRaw(Long storeUid, String sellerProductId) {
        if (sellerProductId == null || sellerProductId.isBlank()) return null;
        Store store = storeRepository.findById(storeUid).orElse(null);
        if (store == null || !"COUPANG".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) return null;
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid).orElse(null);
        if (auth == null || auth.getApiKey() == null || auth.getApiKey().isBlank() || auth.getApiSecret() == null || auth.getApiSecret().isBlank()) return null;
        String path = CoupangApiConstants.PATH_SELLER_PRODUCTS + "/" + sellerProductId.trim();
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(auth.getApiKey().trim(), auth.getApiSecret().trim(), "GET", path, "");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Content-Type", "application/json;charset=UTF-8");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        try {
            ResponseEntity<CoupangProductDetailResponse> response = restTemplate.exchange(
                    CoupangApiConstants.BASE_URL + path, HttpMethod.GET, new HttpEntity<>(headers), CoupangProductDetailResponse.class);
            if (response.getBody() == null || response.getBody().getData() == null) return null;
            CoupangProductListItem data = response.getBody().getData();
            if (log.isDebugEnabled() && data.getItems() != null && !data.getItems().isEmpty()) {
                CoupangProductItemOption first = data.getItems().get(0);
                log.debug("쿠팡 상품 단건 조회 옵션 재고 sellerProductId={} vendorItemId={} maximumBuyCount={}", sellerProductId, first.getVendorItemId(), first.getMaximumBuyCount());
            }
            return data;
        } catch (Exception e) {
            log.debug("상품 단건 원본 조회 실패 sellerProductId={}: {}", sellerProductId, e.getMessage());
            return null;
        }
    }

    /**
     * 엑셀(가격/재고)과 동일하게 옵션 단위로 행을 만든다.
     * items(vendorItems)가 있으면 옵션별 1행, 없으면 상품 1행.
     */
    private List<NaverProductItem> toProductItems(CoupangProductListItem p) {
        if (p == null) return Collections.emptyList();
        List<CoupangProductItemOption> opts = p.getItems();
        if (opts != null && !opts.isEmpty()) {
            String productId = p.getSellerProductId() != null ? String.valueOf(p.getSellerProductId()) : null;
            String statusName = p.getStatusName() != null ? p.getStatusName() : p.getSaleStatus();
            String statusType = normalizeCoupangStatus(statusName);
            return opts.stream().map(opt -> toOptionRow(p, productId, statusName, statusType, opt)).collect(Collectors.toList());
        }
        return Collections.singletonList(toProductItem(p));
    }

    private NaverProductItem toOptionRow(CoupangProductListItem p, String productId, String statusName, String statusType, CoupangProductItemOption opt) {
        Long salePrice = opt.getSalePrice() != null && opt.getSalePrice() > 0 ? opt.getSalePrice() : p.getSalePrice();
        if (salePrice == null && p.getOriginalPrice() != null) salePrice = p.getOriginalPrice();
        Integer stock = resolveOptionStock(opt);
        if (stock == null && p.getStockQuantity() != null) stock = p.getStockQuantity();
        String vendorItemId = opt.getVendorItemId() != null ? String.valueOf(opt.getVendorItemId()) : null;
        return NaverProductItem.builder()
                .channelProductNo(productId)
                .productName(p.getSellerProductName())
                .salePrice(salePrice)
                .originalPrice(opt.getOriginalPrice() != null ? opt.getOriginalPrice() : p.getOriginalPrice())
                .stockQuantity(stock)
                .statusType(statusType != null ? statusType : statusName)
                .representativeImageUrl(p.getImageUrl())
                .leafCategoryId(p.getCategoryId())
                .vendorItemId(vendorItemId)
                .optionName(opt.getVendorItemName())
                .build();
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
                .originalPrice(p.getOriginalPrice())
                .stockQuantity(stockQuantity)
                .statusType(statusType != null ? statusType : statusName)
                .representativeImageUrl(p.getImageUrl())
                .leafCategoryId(p.getCategoryId())
                .build();
    }

    /** 상품 가격: 최상위 salePrice → items/vendorItems[].salePrice → originalPrice (쿠팡 상품 조회 문서) */
    private Long resolveSalePrice(CoupangProductListItem p) {
        if (p.getSalePrice() != null && p.getSalePrice() > 0) return p.getSalePrice();
        List<CoupangProductItemOption> opts = p.getItems();
        if (opts != null && !opts.isEmpty()) {
            for (CoupangProductItemOption opt : opts) {
                if (opt.getSalePrice() != null && opt.getSalePrice() > 0) return opt.getSalePrice();
            }
        }
        if (p.getOriginalPrice() != null && p.getOriginalPrice() > 0) return p.getOriginalPrice();
        return null;
    }

    /** 옵션 한 건의 재고: quantity → sellableQuantity → maximumBuyCount (실제 API는 재고를 maximumBuyCount로 내려줌) */
    private Integer resolveOptionStock(CoupangProductItemOption opt) {
        if (opt == null) return null;
        if (opt.getQuantity() != null && opt.getQuantity() >= 0) return opt.getQuantity();
        if (opt.getSellableQuantity() != null && opt.getSellableQuantity() >= 0) return opt.getSellableQuantity();
        if (opt.getMaximumBuyCount() != null && opt.getMaximumBuyCount() >= 0) return opt.getMaximumBuyCount();
        return null;
    }

    /** 재고: 최상위 stockQuantity → items[].quantity/sellableQuantity/unitCount 합계 */
    private Integer resolveStockQuantity(CoupangProductListItem p) {
        if (p.getStockQuantity() != null && p.getStockQuantity() > 0) return p.getStockQuantity();
        List<CoupangProductItemOption> opts = p.getItems();
        if (opts != null && !opts.isEmpty()) {
            int sum = 0;
            for (CoupangProductItemOption opt : opts) {
                Integer q = resolveOptionStock(opt);
                if (q != null) sum += q;
            }
            if (sum == 0 && log.isDebugEnabled() && !opts.isEmpty()) {
                CoupangProductItemOption first = opts.get(0);
                log.debug("쿠팡 옵션 재고 미매핑 sellerProductId={} vendorItemId={} maximumBuyCount={}", p.getSellerProductId(), first.getVendorItemId(), first.getMaximumBuyCount());
            }
            return sum > 0 ? sum : null;
        }
        return null;
    }

    /** 목록 API에 가격/재고가 없을 때 상품 조회(단건) API로 보강. 상세에 옵션이 있으면 해당 상품을 옵션 단위 행으로 확장(엑셀과 동일).
     * 동일 sellerProductId에 대해 상세 API는 1회만 호출하여 중복 제거. */
    private void enrichPriceAndStockFromDetail(Long storeUid, List<NaverProductItem> items) {
        if (items == null || items.isEmpty()) return;
        List<NaverProductItem> result = new ArrayList<>();
        Set<String> processedProductIds = new HashSet<>();
        for (NaverProductItem it : items) {
            boolean needPrice = it.getSalePrice() == null || it.getSalePrice() == 0;
            boolean needStock = it.getStockQuantity() == null || it.getStockQuantity() == 0;
            if (!needPrice && !needStock) {
                result.add(it);
                continue;
            }
            String id = it.getChannelProductNo();
            if (id == null || id.isBlank()) {
                result.add(it);
                continue;
            }
            if (processedProductIds.contains(id)) {
                continue;
            }
            CoupangProductListItem raw = fetchProductDetailRaw(storeUid, id);
            if (raw != null && raw.getItems() != null && !raw.getItems().isEmpty()) {
                result.addAll(toProductItems(raw));
                processedProductIds.add(id);
            } else {
                if (raw != null) {
                    Long salePrice = resolveSalePrice(raw);
                    Integer stockQty = resolveStockQuantity(raw);
                    if (needPrice && salePrice != null) it.setSalePrice(salePrice);
                    if (needStock && stockQty != null) it.setStockQuantity(stockQty);
                    if (it.getOriginalPrice() == null && raw.getOriginalPrice() != null) it.setOriginalPrice(raw.getOriginalPrice());
                }
                result.add(it);
            }
        }
        items.clear();
        items.addAll(result);
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
        @JsonAlias({"stock_quantity", "quantity", "sellableQuantity", "sellable_quantity", "sellableQty", "stockQty", "availableQuantity", "available_quantity"})
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
        @JsonAlias({"vendorItems", "vendor_items", "options"})
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
        /** 재고 수량 (엑셀 12열) - quantity / sellableQuantity 둘 다 매핑 */
        @JsonProperty("quantity")
        @JsonAlias({"stock_quantity", "stockQuantity", "sellableQty", "stockQty", "availableQuantity", "available_quantity", "inventoryQuantity", "inventory_quantity", "stock", "qty"})
        private Integer quantity;
        /** 쿠팡 문서: 판매가능수량 (상품 조회 시 items[].sellableQuantity) */
        @JsonProperty("sellableQuantity")
        @JsonAlias({"sellable_quantity"})
        private Integer sellableQuantity;
        /** 응답 예시에 있음 (단위 수. 재고 아님) */
        @JsonProperty("unitCount")
        @JsonAlias({"unit_count"})
        private Integer unitCount;
        /** 쿠팡 상품 조회 API 실제 응답: 재고 수량이 maximumBuyCount로 옴 (777, 888 등) */
        @JsonProperty("maximumBuyCount")
        @JsonAlias({"maximum_buy_count"})
        private Integer maximumBuyCount;
        @JsonProperty("vendorItemId")
        @JsonAlias({"vendor_item_id"})
        private Long vendorItemId;
        @JsonProperty("vendorItemName")
        @JsonAlias({"vendor_item_name", "itemName", "item_name", "optionName", "option_name", "optionInfo"})
        private String vendorItemName;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CoupangProductDetailResponse {
        @JsonProperty("data")
        private CoupangProductListItem data;
    }
}
