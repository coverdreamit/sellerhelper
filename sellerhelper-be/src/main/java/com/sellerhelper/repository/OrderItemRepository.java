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

    List<OrderItem> findByOrder_UidIn(java.util.Collection<Long> orderUids);

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

    /**
     * 발주업체로 지정된 스토어 상품에서 뽑은 매칭 키로 주문 라인 조회.
     * channelType 값이 비어있거나 플랫폼별 코드가 달라도 매칭되도록 ID 중심으로 조회한다.
     */
    @Query(
            value = "SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.store.uid = :storeUid AND "
                    + "((:coupangActive = true AND (oi.mallItemId IN :coupangIds OR oi.externalProductId IN :coupangIds OR oi.externalOptionId IN :coupangIds OR oi.sellerSku IN :coupangIds)) OR "
                    + "(:naverActive = true AND (oi.externalProductId IN :naverIds OR oi.externalOptionId IN :naverIds OR oi.sellerSku IN :naverIds OR oi.mallItemId IN :naverIds))) "
                    + "ORDER BY o.orderDate DESC",
            countQuery = "SELECT COUNT(oi) FROM OrderItem oi JOIN oi.order o WHERE o.store.uid = :storeUid AND "
                    + "((:coupangActive = true AND (oi.mallItemId IN :coupangIds OR oi.externalProductId IN :coupangIds OR oi.externalOptionId IN :coupangIds OR oi.sellerSku IN :coupangIds)) OR "
                    + "(:naverActive = true AND (oi.externalProductId IN :naverIds OR oi.externalOptionId IN :naverIds OR oi.sellerSku IN :naverIds OR oi.mallItemId IN :naverIds)))")
    Page<OrderItem> findOrderLinesForVendorProductKeys(
            @Param("storeUid") Long storeUid,
            @Param("coupangActive") boolean coupangActive,
            @Param("coupangIds") List<String> coupangIds,
            @Param("naverActive") boolean naverActive,
            @Param("naverIds") List<String> naverIds,
            Pageable pageable);

    List<OrderItem> findTop2000ByOrder_Store_UidOrderByOrder_OrderDateDesc(Long storeUid);
}
