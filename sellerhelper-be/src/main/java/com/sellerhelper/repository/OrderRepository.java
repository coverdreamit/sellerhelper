package com.sellerhelper.repository;

import com.sellerhelper.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByStore_UidAndMallOrderNo(Long storeUid, String mallOrderNo);

    Optional<Order> findTopByStore_UidOrderByOrderDateDesc(Long storeUid);

    Optional<Order> findByUidAndStore_Uid(Long uid, Long storeUid);

    Page<Order> findByStore_UidOrderByOrderDateDesc(Long storeUid, Pageable pageable);

    /** 배송목록 조회: 상태별 필터 (네이버: PAYED=출고대기, DELIVERING=배송중, DELIVERED=배송완료) */
    Page<Order> findByStore_UidAndOrderStatusOrderByOrderDateDesc(Long storeUid, String orderStatus, Pageable pageable);
}
