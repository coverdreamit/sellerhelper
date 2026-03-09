package com.sellerhelper.repository;

import com.sellerhelper.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.store.uid = :storeUid AND o.mallOrderNo = :mallOrderNo")
    Optional<Order> findByStoreUidAndMallOrderNo(@Param("storeUid") Long storeUid, @Param("mallOrderNo") String mallOrderNo);

    @Query("SELECT o FROM Order o WHERE o.store.uid = :storeUid ORDER BY o.orderDate DESC")
    List<Order> findByStoreUidOrderByOrderDateDesc(@Param("storeUid") Long storeUid, Pageable pageable);
}
