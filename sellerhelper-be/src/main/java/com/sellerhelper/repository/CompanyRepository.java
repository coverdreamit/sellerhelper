package com.sellerhelper.repository;

import com.sellerhelper.entity.Company;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByName(String name);

    Optional<Company> findByBusinessNumber(String businessNumber);

    List<Company> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
