package com.sellerhelper.repository;

import com.sellerhelper.entity.StoreProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreProductRepository extends JpaRepository<StoreProduct, Long> {

    Page<StoreProduct> findByStore_UidOrderByProductNameAscVendorItemIdAsc(Long storeUid, Pageable pageable);

    long countByStore_Uid(Long storeUid);

    void deleteByStore_Uid(Long storeUid);

    /** 해당 스토어 상품 중 가장 최근 동기화 시각 조회용 */
    StoreProduct findTop1ByStore_UidOrderBySyncedAtDesc(Long storeUid);
}
