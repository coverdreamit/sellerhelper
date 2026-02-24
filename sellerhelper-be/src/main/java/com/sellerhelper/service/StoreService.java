package com.sellerhelper.service;

import com.sellerhelper.dto.store.StoreConnectRequest;
import com.sellerhelper.dto.store.StoreCreateRequest;
import com.sellerhelper.dto.store.StoreMyUpdateRequest;
import com.sellerhelper.dto.store.StoreResponse;
import com.sellerhelper.dto.store.StoreUpdateRequest;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Mall;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.MallRepository;
import com.sellerhelper.repository.StoreAuthRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.hasText;

/** 스토어 CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final MallRepository mallRepository;
    private final CompanyRepository companyRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final UserRepository userRepository;
    private final StoreConnectionVerifier storeConnectionVerifier;

    @Transactional(readOnly = true)
    public List<StoreResponse> findAll(Long mallUid, Long companyUid) {
        List<Store> list;
        if (mallUid != null && companyUid != null) {
            list = storeRepository.findByMall_Uid(mallUid).stream()
                    .filter(s -> s.getCompany() != null && s.getCompany().getUid().equals(companyUid))
                    .collect(Collectors.toList());
        } else if (mallUid != null) {
            list = storeRepository.findByMall_Uid(mallUid);
        } else if (companyUid != null) {
            list = storeRepository.findByCompany_UidOrderBySortOrderAscUidAsc(companyUid);
        } else {
            list = storeRepository.findAll();
        }
        Set<Long> storeIdsWithAuth = storeIdsWithAuth();
        Set<Long> storeIdsWithStoredCredentials = storeIdsWithStoredCredentials();
        return list.stream()
                .map(s -> toResponse(s,
                        storeIdsWithAuth.contains(s.getUid()),
                        storeIdsWithStoredCredentials.contains(s.getUid())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreResponse findByUid(Long uid) {
        Store store = storeRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", uid));
        boolean hasAuth = hasValidCredentials(uid);
        boolean hasStoredCredentials = hasStoredCredentialsForStore(uid);
        return toResponse(store, hasAuth, hasStoredCredentials);
    }

    @Transactional
    public StoreResponse create(StoreCreateRequest req) {
        Mall mall = mallRepository.findById(req.getMallUid())
                .orElseThrow(() -> new ResourceNotFoundException("Mall", req.getMallUid()));
        Company company = req.getCompanyUid() != null
                ? companyRepository.findById(req.getCompanyUid()).orElse(null)
                : null;
        Store store = Store.builder()
                .mall(mall)
                .company(company)
                .name(req.getName())
                .mallSellerId(req.getMallSellerId())
                .enabled(req.getEnabled() != null ? req.getEnabled() : true)
                .build();
        store = storeRepository.save(store);
        return toResponse(store, false, false);
    }

    @Transactional
    public StoreResponse update(Long uid, StoreUpdateRequest req) {
        Store store = storeRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", uid));
        if (Boolean.TRUE.equals(req.getClearCompany())) {
            store.setCompany(null);
        } else if (req.getCompanyUid() != null) {
            Company company = companyRepository.findById(req.getCompanyUid()).orElse(null);
            store.setCompany(company);
        }
        if (req.getName() != null) store.setName(req.getName());
        if (req.getMallSellerId() != null) store.setMallSellerId(req.getMallSellerId());
        if (req.getEnabled() != null) store.setEnabled(req.getEnabled());
        store = storeRepository.save(store);
        boolean hasAuth = hasValidCredentials(uid);
        boolean hasStoredCredentials = hasStoredCredentialsForStore(uid);
        return toResponse(store, hasAuth, hasStoredCredentials);
    }

    @Transactional
    public void delete(Long uid) {
        Store store = storeRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", uid));
        storeRepository.delete(store);
    }

    /** 셀러: 내 회사 스토어 목록 (플랫폼 선택 후 API 연동한 것) */
    @Transactional(readOnly = true)
    public List<StoreResponse> findMyStores(Long userUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Company company = user.getCompany();
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (company == null) return List.of();
        List<Store> list = storeRepository.findByCompany_UidOrderBySortOrderAscUidAsc(company.getUid());
        Set<Long> storeIdsWithAuth = storeIdsWithAuth();
        Set<Long> storeIdsWithStoredCredentials = storeIdsWithStoredCredentials();
        return list.stream()
                .map(s -> toResponse(s,
                        storeIdsWithAuth.contains(s.getUid()),
                        storeIdsWithStoredCredentials.contains(s.getUid())))
                .collect(Collectors.toList());
    }

    /** 셀러: 플랫폼 선택 + API 입력 → Store + StoreAuth 생성 */
    @Transactional
    public StoreResponse connectStore(Long userUid, StoreConnectRequest req) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Company company = user.getCompany();
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("회사가 등록되어 있지 않습니다. 관리자에게 문의하세요."));
        }
        Mall mall = mallRepository.findById(req.getMallUid())
                .orElseThrow(() -> new ResourceNotFoundException("Mall", req.getMallUid()));
        if (!mall.getEnabled()) {
            throw new IllegalArgumentException("해당 플랫폼은 현재 사용할 수 없습니다.");
        }
        List<Store> existing = storeRepository.findByCompany_UidOrderBySortOrderAscUidAsc(company.getUid());
        int nextOrder = existing.isEmpty() ? 0 : (existing.get(existing.size() - 1).getSortOrder() != null
                ? existing.get(existing.size() - 1).getSortOrder() + 1 : existing.size());
        Store store = Store.builder()
                .mall(mall)
                .company(company)
                .name(req.getName())
                .enabled(true)
                .build();
        store.setSortOrder(nextOrder);
        store = storeRepository.save(store);
        StoreAuth auth = StoreAuth.builder()
                .store(store)
                .apiKey(req.getApiKey())
                .apiSecret(req.getApiSecret())
                .verifiedAt(null)  /* 연동 테스트 성공 시에만 설정됨 */
                .build();
        storeAuthRepository.save(auth);
        boolean hasCreds = hasText(req.getApiKey()) || hasText(req.getApiSecret());
        return toResponse(store, false, hasCreds);  /* API 검증 성공 전까지는 미연동 */
    }

    /** 셀러: 내 스토어 수정 (본인 회사 스토어만) */
    @Transactional
    public StoreResponse updateMyStore(Long userUid, Long storeUid, StoreMyUpdateRequest req) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null) {
            userCompany = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어를 수정할 권한이 없습니다.");
        }
        if (req.getName() != null) store.setName(req.getName());
        if (req.getEnabled() != null) store.setEnabled(req.getEnabled());
        store = storeRepository.save(store);
        if (req.getApiKey() != null || req.getApiSecret() != null) {
            storeAuthRepository.findByStore_Uid(storeUid).ifPresent(auth -> {
                if (req.getApiKey() != null) auth.setApiKey(req.getApiKey());
                if (req.getApiSecret() != null) auth.setApiSecret(req.getApiSecret());
                auth.setVerifiedAt(null);  /* API 키 변경 시 검증 상태 초기화 */
                storeAuthRepository.save(auth);
            });
        }
        boolean hasAuth = hasValidCredentials(storeUid);
        boolean hasStoredCredentials = hasStoredCredentialsForStore(storeUid);
        return toResponse(store, hasAuth, hasStoredCredentials);
    }

    /** 셀러: 스토어 순서 변경 (탭 순서 = 그리드 순서) */
    @Transactional
    public void reorderMyStores(Long userUid, java.util.List<Long> storeUids) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Company company = user.getCompany();
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (company == null) {
            throw new IllegalArgumentException("회사가 등록되어 있지 않습니다.");
        }
        for (int i = 0; i < storeUids.size(); i++) {
            Long uid = storeUids.get(i);
            Store store = storeRepository.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("Store", uid));
            if (store.getCompany() == null || !store.getCompany().getUid().equals(company.getUid())) {
                throw new IllegalArgumentException("해당 스토어의 순서를 변경할 권한이 없습니다: " + uid);
            }
            store.setSortOrder(i);
            storeRepository.save(store);
        }
    }

    /** 셀러: 연동 해제 (본인 회사 스토어만 삭제 가능) */
    @Transactional
    public void disconnectMyStore(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null) {
            userCompany = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어를 연동 해제할 권한이 없습니다.");
        }
        storeAuthRepository.findByStore_Uid(storeUid).ifPresent(storeAuthRepository::delete);
        storeRepository.delete(store);
    }

    /** API 등록 후 실제 연동 검증 성공한 스토어만 연동됨 */
    private boolean hasValidCredentials(Long storeUid) {
        return storeAuthRepository.findByStore_Uid(storeUid)
                .filter(a -> hasText(a.getApiKey()) || hasText(a.getApiSecret()))
                .filter(a -> a.getVerifiedAt() != null)
                .isPresent();
    }

    private Set<Long> storeIdsWithAuth() {
        return storeAuthRepository.findAll().stream()
                .filter(a -> hasText(a.getApiKey()) || hasText(a.getApiSecret()))
                .filter(a -> a.getVerifiedAt() != null)
                .map(a -> a.getStore().getUid())
                .collect(Collectors.toSet());
    }

    /** 셀러: 연동 테스트 (실제 API 호출로 검증, 성공 시 연동됨으로 표시) */
    @Transactional
    public StoreResponse verifyMyStore(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null) {
            userCompany = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어를 검증할 권한이 없습니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. API Key/Secret을 먼저 입력하세요."));
        if (!hasText(auth.getApiKey()) || !hasText(auth.getApiSecret())) {
            throw new IllegalArgumentException("API Key와 API Secret을 모두 입력해야 연동 테스트할 수 있습니다.");
        }
        if (!storeConnectionVerifier.verify(store, auth)) {
            throw new IllegalArgumentException("연동 검증에 실패했습니다. API Key·Secret을 확인하세요.");
        }
        auth.setVerifiedAt(java.time.Instant.now());
        storeAuthRepository.save(auth);
        return toResponse(store, true, true);
    }

    /** API Key/Secret 저장 여부 (검증 여부와 무관) */
    private boolean hasStoredCredentialsForStore(Long storeUid) {
        return storeAuthRepository.findByStore_Uid(storeUid)
                .filter(a -> hasText(a.getApiKey()) || hasText(a.getApiSecret()))
                .isPresent();
    }

    private Set<Long> storeIdsWithStoredCredentials() {
        return storeAuthRepository.findAll().stream()
                .filter(a -> hasText(a.getApiKey()) || hasText(a.getApiSecret()))
                .map(a -> a.getStore().getUid())
                .collect(Collectors.toSet());
    }

    private StoreResponse toResponse(Store s, boolean hasAuth, boolean hasStoredCredentials) {
        return StoreResponse.builder()
                .uid(s.getUid())
                .mallUid(s.getMall().getUid())
                .mallCode(s.getMall().getCode())
                .mallName(s.getMall().getName())
                .companyUid(s.getCompany() != null ? s.getCompany().getUid() : null)
                .companyName(s.getCompany() != null ? s.getCompany().getName() : null)
                .name(s.getName())
                .mallSellerId(s.getMallSellerId())
                .enabled(s.getEnabled())
                .sortOrder(s.getSortOrder())
                .hasAuth(hasAuth)
                .hasStoredCredentials(hasStoredCredentials)
                .build();
    }
}
