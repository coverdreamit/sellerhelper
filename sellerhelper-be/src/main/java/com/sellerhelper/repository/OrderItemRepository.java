package com.sellerhelper.repository;

import com.sellerhelper.entity.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_Uid(Long orderUid);

    java.util.Optional<OrderItem> findByOrder_UidAndMallItemId(Long orderUid, String mallItemId);

    /** 클레임 유형 하나로 필터 (취소/반품/교환) - productOrderStatus에 claimKeyword 포함 */
    Page<OrderItem> findByOrder_Store_UidAndProductOrderStatusContainingOrderByOrder_OrderDateDesc(
            Long storeUid, String claimKeyword, Pageable pageable);

    /** 취소/반품/교환 전체 - productOrderStatus에 CANCEL 또는 RETURN 또는 EXCHANGE 포함, 검색어 선택 */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.store.uid = :storeUid " +
            "AND (LOWER(oi.productOrderStatus) LIKE '%cancel%' OR LOWER(oi.productOrderStatus) LIKE '%return%' OR LOWER(oi.productOrderStatus) LIKE '%exchange%') " +
            "AND (:keyword IS NULL OR :keyword = '' OR LOWER(o.mallOrderNo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(oi.mallItemId) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY o.orderDate DESC")
    Page<OrderItem> findClaimItemsByStoreAllTypes(
            @Param("storeUid") Long storeUid,
            @Param("keyword") String keyword,
            Pageable pageable);

    /** 클레임 유형 하나 + 검색어 선택 */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.store.uid = :storeUid " +
            "AND LOWER(oi.productOrderStatus) LIKE LOWER(CONCAT('%', :claimKeyword, '%')) " +
            "AND (:keyword IS NULL OR :keyword = '' OR LOWER(o.mallOrderNo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(oi.mallItemId) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY o.orderDate DESC")
    Page<OrderItem> findClaimItemsByStoreAndType(
            @Param("storeUid") Long storeUid,
            @Param("claimKeyword") String claimKeyword,
            @Param("keyword") String keyword,
            Pageable pageable);
}
