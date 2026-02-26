package com.sellerhelper.service;

import com.sellerhelper.dto.naver.*;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.service.naver.NaverCommerceOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

/** 스토어별 주문·배송 조회 (플랫폼별 위임) */
@Service
@RequiredArgsConstructor
public class StoreOrderService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final NaverCommerceOrderService naverOrderService;

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
