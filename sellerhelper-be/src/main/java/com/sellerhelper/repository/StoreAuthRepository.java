package com.sellerhelper.repository;

import com.sellerhelper.entity.StoreAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreAuthRepository extends JpaRepository<StoreAuth, Long> {

    Optional<StoreAuth> findByStore_Uid(Long storeUid);
}
