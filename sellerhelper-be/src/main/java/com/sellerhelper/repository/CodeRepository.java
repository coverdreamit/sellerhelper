package com.sellerhelper.repository;

import com.sellerhelper.entity.Code;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, Long> {

    List<Code> findByGroupUidOrderBySortOrderAsc(Long groupUid);

    Optional<Code> findByGroupUidAndCode(Long groupUid, String code);
}
