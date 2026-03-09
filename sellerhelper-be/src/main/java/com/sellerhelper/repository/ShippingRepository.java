package com.sellerhelper.repository;

import com.sellerhelper.entity.Shipping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {

    List<Shipping> findByOrderUid(Long orderUid);

    Optional<Shipping> findByOrderUidAndUid(Long orderUid, Long uid);

    /** 스토어별 배송 목록 (주문일시 내림차순) */
    Page<Shipping> findByOrder_Store_UidOrderByOrder_OrderDateDesc(Long storeUid, Pageable pageable);

    /** 스토어별 배송 목록 + 상태 필터 (단일) */
    Page<Shipping> findByOrder_Store_UidAndShippingStatusOrderByOrder_OrderDateDesc(Long storeUid, String shippingStatus, Pageable pageable);

    /** 스토어별 배송 목록 + 상태 여러 값 (예: 출고대기 = PENDING, READY) */
    Page<Shipping> findByOrder_Store_UidAndShippingStatusInOrderByOrder_OrderDateDesc(Long storeUid, List<String> shippingStatuses, Pageable pageable);

    Optional<Shipping> findByOrder_Uid(Long orderUid);
}
