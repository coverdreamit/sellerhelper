package com.sellerhelper.repository;

import com.sellerhelper.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_Uid(Long orderUid);

    java.util.Optional<OrderItem> findByOrder_UidAndMallItemId(Long orderUid, String mallItemId);
}
