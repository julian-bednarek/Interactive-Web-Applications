package com.julian.webdziekanat_backend.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "auth0")
@RequiredArgsConstructor
@Getter
@Setter
public class Auth0Properties {
    private String domain;
    private String clientId;
    private String clientSecret;
    private String audience;

    public String getDomainUrl() {
        return "https://" + domain;
    }
}