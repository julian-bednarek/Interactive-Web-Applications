package com.julian.webdziekanat_backend.dto.auth0;

import com.julian.webdziekanat_backend.model.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Auth0DTO {
    private String user_id;
    private Roles role;
}
