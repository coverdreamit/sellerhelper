package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Size;

/** 스토어 수정 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreUpdateRequest {

    /** 소속 회사 UID (null이면 변경 안 함, clearCompany true면 회사 해제) */
    private Long companyUid;

    /** true면 company를 null로 설정 */
    private Boolean clearCompany;

    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String mallSellerId;

    private Boolean enabled;
}
