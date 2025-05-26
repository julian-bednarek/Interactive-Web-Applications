package com.julian.webdziekanat_backend.dto.auth0;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenRequest {
    private String client_id;
    private String client_secret;
    private String audience;
    private String grant_type;
}
