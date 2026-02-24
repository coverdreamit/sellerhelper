package com.sellerhelper.service;

import com.sellerhelper.dto.mall.MallCreateRequest;
import com.sellerhelper.dto.mall.MallResponse;
import com.sellerhelper.dto.mall.MallUpdateRequest;
import com.sellerhelper.entity.Mall;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.MallRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/** 플랫폼(Mall) CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class MallService {

    private final MallRepository mallRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<MallResponse> findAll() {
        return mallRepository.findAllByOrderBySortOrderAscUidAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reorder(List<Long> mallUids) {
        for (int i = 0; i < mallUids.size(); i++) {
            Long mallUid = mallUids.get(i);
            Mall mall = mallRepository.findById(mallUid)
                    .orElseThrow(() -> new ResourceNotFoundException("Mall", mallUid));
            mall.setSortOrder(i);
            mallRepository.save(mall);
        }
    }

    @Transactional(readOnly = true)
    public List<MallResponse> findAllEnabled() {
        return mallRepository.findByEnabledTrueOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MallResponse findByUid(Long uid) {
        Mall mall = mallRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Mall", uid));
        return toResponse(mall);
    }

    @Transactional
    public MallResponse create(MallCreateRequest req) {
        if (mallRepository.findByCode(req.getCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 플랫폼 코드입니다: " + req.getCode());
        }
        Mall mall = Mall.builder()
                .code(req.getCode().toUpperCase())
                .name(req.getName())
                .channel(req.getChannel())
                .description(req.getDescription())
                .apiBaseUrl(req.getApiBaseUrl())
                .enabled(req.getEnabled() != null ? req.getEnabled() : true)
                .build();
        mall = mallRepository.save(mall);
        return toResponse(mall);
    }

    @Transactional
    public MallResponse update(Long uid, MallUpdateRequest req) {
        Mall mall = mallRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Mall", uid));
        if (req.getName() != null) mall.setName(req.getName());
        if (req.getChannel() != null) mall.setChannel(req.getChannel());
        if (req.getDescription() != null) mall.setDescription(req.getDescription());
        if (req.getApiBaseUrl() != null) mall.setApiBaseUrl(req.getApiBaseUrl());
        if (req.getEnabled() != null) mall.setEnabled(req.getEnabled());
        mall = mallRepository.save(mall);
        return toResponse(mall);
    }

    @Transactional
    public void delete(Long uid) {
        Mall mall = mallRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Mall", uid));
        if (!storeRepository.findByMall_Uid(uid).isEmpty()) {
            throw new IllegalArgumentException(
                    "해당 플랫폼을 사용하는 스토어가 있어 삭제할 수 없습니다. 먼저 환경설정 > 스토어 관리에서 해당 플랫폼의 스토어 연동을 해제하세요.");
        }
        mallRepository.delete(mall);
    }

    private MallResponse toResponse(Mall m) {
        return MallResponse.builder()
                .uid(m.getUid())
                .code(m.getCode())
                .name(m.getName())
                .channel(m.getChannel())
                .description(m.getDescription())
                .apiBaseUrl(m.getApiBaseUrl())
                .enabled(m.getEnabled())
                .sortOrder(m.getSortOrder())
                .build();
    }
}
