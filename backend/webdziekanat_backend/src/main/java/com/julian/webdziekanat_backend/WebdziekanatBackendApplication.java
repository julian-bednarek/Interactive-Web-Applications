package com.julian.webdziekanat_backend;

import com.julian.webdziekanat_backend.config.Auth0Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableConfigurationProperties(Auth0Properties.class)
@EnableMethodSecurity
public class WebdziekanatBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebdziekanatBackendApplication.class, args);
    }

}
