package com.sellerhelper.repository;

import com.sellerhelper.entity.StoreProduct;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoreProductRepository extends JpaRepository<StoreProduct, Long> {

    @EntityGraph(attributePaths = {"assignedVendor"})
    Page<StoreProduct> findByStore_UidOrderBySellerProductIdAscVendorItemIdAsc(Long storeUid, Pageable pageable);

    @EntityGraph(attributePaths = {"assignedVendor"})
    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.uid = :storeUid ORDER BY sp.sellerProductId ASC, sp.vendorItemId ASC")
    List<StoreProduct> findAllByStore_UidOrderBySellerProductIdAscVendorItemIdAscWithVendor(
            @Param("storeUid") Long storeUid);

    Optional<StoreProduct> findByStore_UidAndSellerProductIdAndVendorItemId(
            Long storeUid, String sellerProductId, String vendorItemId);

    /** 스토어별 전체 상품 목록 (동기화 시 기존 데이터와 비교용) */
    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.uid = :storeUid")
    List<StoreProduct> findAllByStore_Uid(@Param("storeUid") Long storeUid);

    /** 스토어별 전체 상품 목록 정렬 (조회용) */
    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.uid = :storeUid ORDER BY sp.sellerProductId ASC, sp.vendorItemId ASC")
    List<StoreProduct> findAllByStore_UidOrderBySellerProductIdAscVendorItemIdAsc(@Param("storeUid") Long storeUid);

    Optional<StoreProduct> findByStore_UidAndVendorItemId(Long storeUid, String vendorItemId);

    Optional<StoreProduct> findFirstByStore_UidAndSellerProductId(Long storeUid, String sellerProductId);

    long countByStore_Uid(Long storeUid);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM StoreProduct sp WHERE sp.store.uid = :storeUid")
    void deleteByStore_Uid(@Param("storeUid") Long storeUid);

    /** 해당 스토어 상품 중 가장 최근 동기화 시각 조회용 */
    StoreProduct findTop1ByStore_UidOrderBySyncedAtDesc(Long storeUid);

    @EntityGraph(attributePaths = {"assignedVendor"})
    List<StoreProduct> findByStore_UidAndAssignedVendor_Uid(Long storeUid, Long vendorUid);
}
