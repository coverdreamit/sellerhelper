package com.sellerhelper.repository;

import com.sellerhelper.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByStoreUidAndMallOrderNo(Long storeUid, String mallOrderNo);

    List<Order> findByStoreUidOrderByOrderDateDesc(Long storeUid, org.springframework.data.domain.Pageable pageable);
}
