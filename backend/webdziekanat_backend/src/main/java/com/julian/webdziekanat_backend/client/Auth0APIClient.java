package com.julian.webdziekanat_backend.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.julian.webdziekanat_backend.config.Auth0Properties;
import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.dto.auth0.TokenRequest;
import com.julian.webdziekanat_backend.dto.auth0.TokenResponse;
import com.julian.webdziekanat_backend.model.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;

@Component
public class Auth0APIClient {

    private final Auth0Properties auth0Properties;
    private final RestTemplate restTemplate;

    private String cachedToken;

    @Autowired
    public Auth0APIClient(Auth0Properties auth0Properties, RestTemplateBuilder restTemplateBuilder) {
        this.auth0Properties = auth0Properties;
        this.restTemplate = restTemplateBuilder.build();
    }

    private String getManagementToken() {
        if (cachedToken != null) {
            return cachedToken;
        }
        TokenRequest tokenRequest = new TokenRequest(
                auth0Properties.getClientId(),
                auth0Properties.getClientSecret(),
                auth0Properties.getAudience(),
                "client_credentials"
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<TokenRequest> requestEntity = new HttpEntity<>(tokenRequest, headers);
        String tokenUrl = "%s/oauth/token".formatted(auth0Properties.getDomainUrl());
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                tokenUrl,
                requestEntity,
                TokenResponse.class
        );
        TokenResponse tokenResponse = response.getBody();
        if (tokenResponse != null && tokenResponse.getAccessToken() != null) {
            this.cachedToken = tokenResponse.getAccessToken();
            return this.cachedToken;
        } else {
            throw new RuntimeException("Failed to retrieve Auth0 management token. Response: %s".formatted(response.getStatusCode()));
        }
    }

    public List<Auth0DTO> fetchAllUsers() {
        String token = getManagementToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        String usersUrl = UriComponentsBuilder.fromUriString(auth0Properties.getDomainUrl())
                .path("/api/v2/users")
                .queryParam("fields", "user_id")
                .queryParam("include_fields", "true")
                .toUriString();

        ResponseEntity<List<Auth0DTO>> response = restTemplate.exchange(
                usersUrl,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<Auth0DTO>>() {}
        );
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to fetch users from Auth0. Status code: %s".formatted(response.getStatusCode()));
        }
    }

    public Roles getUserRole(String userId) {
        String token = getManagementToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        String rolesUrl = UriComponentsBuilder.fromUriString(auth0Properties.getDomainUrl())
                .path("/api/v2/users/{usedId}/roles")
                .buildAndExpand(userId)
                .toUriString();

        ResponseEntity<List<RoleDTO>> response = restTemplate.exchange(
                rolesUrl,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<RoleDTO>>() {}
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return Roles.fromString(response.getBody().get(0).getName());
        } else {
            throw new RuntimeException("Failed to fetch user roles from Auth0. Status: %s".formatted(response.getStatusCode()));
        }
    }

    @Data
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class RoleDTO {
        @JsonProperty("id")
        private String id;
        @JsonProperty("name")
        private String name;
        @JsonProperty("description")
        private String description;
    }
}