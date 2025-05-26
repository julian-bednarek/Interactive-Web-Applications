package com.julian.webdziekanat_backend.services.interfaces;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface Auth0Service {
    void syncUsers();
}
