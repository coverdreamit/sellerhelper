package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.util.List;

/** 스토어 순서 변경 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoreReorderRequest {

    @NotNull(message = "스토어 UID 목록은 필수입니다")
    private List<Long> storeUids;
}
