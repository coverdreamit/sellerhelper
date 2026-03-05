package com.sellerhelper.repository;

import com.sellerhelper.entity.ProductMall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductMallRepository extends JpaRepository<ProductMall, Long> {

    List<ProductMall> findByProductUid(Long productUid);

    List<ProductMall> findByStoreUid(Long storeUid);

    Optional<ProductMall> findByProductUidAndStoreUid(Long productUid, Long storeUid);
}
