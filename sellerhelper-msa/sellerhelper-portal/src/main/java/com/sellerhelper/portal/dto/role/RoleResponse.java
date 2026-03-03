package com.sellerhelper.portal.dto.role;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {

    private Long uid;
    private String code;
    private String name;
    private String description;
    private List<String> menuKeys;
}
