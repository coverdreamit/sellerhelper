package com.sellerhelper.dto.mall;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.util.List;

/** 플랫폼 순서 변경 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MallReorderRequest {

    @NotNull(message = "플랫폼 UID 목록은 필수입니다")
    private List<Long> mallUids;
}
