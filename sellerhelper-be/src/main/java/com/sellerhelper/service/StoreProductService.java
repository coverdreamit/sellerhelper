package com.sellerhelper.service;

import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.service.naver.NaverCommerceProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 스토어별 상품목록 조회 (플랫폼별 위임) */
@Service
@RequiredArgsConstructor
public class StoreProductService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final NaverCommerceProductService naverProductService;

    /**
     * 내 스토어 상품목록 조회 (본인 회사 스토어만)
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

        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if ("NAVER".equalsIgnoreCase(mallCode)) {
            return naverProductService.getProductList(storeUid, page, size);
        }

        return NaverProductSearchResult.empty(page, size);
    }
}
