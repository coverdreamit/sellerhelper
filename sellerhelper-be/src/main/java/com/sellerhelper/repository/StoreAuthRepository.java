package com.sellerhelper.repository;

import com.sellerhelper.entity.StoreAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface StoreAuthRepository extends JpaRepository<StoreAuth, Long> {

    Optional<StoreAuth> findByStore_Uid(Long storeUid);

    /** 지정된 스토어들의 StoreAuth만 조회 + Store JOIN FETCH (findAll 대체, IN 절 사용) */
    @Query("SELECT a FROM StoreAuth a JOIN FETCH a.store WHERE a.store.uid IN :storeUids")
    List<StoreAuth> findByStore_UidInWithStore(@Param("storeUids") Collection<Long> storeUids);
}
