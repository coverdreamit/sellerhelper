package com.sellerhelper.portal.dto.role;

import lombok.*;

import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleUpdateRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private List<String> menuKeys;
}
