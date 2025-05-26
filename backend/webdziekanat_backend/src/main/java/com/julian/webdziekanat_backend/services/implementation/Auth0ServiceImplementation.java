package com.julian.webdziekanat_backend.services.implementation;

import com.julian.webdziekanat_backend.client.Auth0APIClient;
import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.model.Auth0;
import com.julian.webdziekanat_backend.model.enums.Roles;
import com.julian.webdziekanat_backend.repositories.Auth0Repository;
import com.julian.webdziekanat_backend.services.interfaces.Auth0Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Auth0ServiceImplementation implements Auth0Service {

    private final Auth0Repository auth0Repository;
    private final Auth0APIClient auth0APIClient;

    @Override
    public void syncUsers() {
        List<Auth0DTO> auth0Users = auth0APIClient.fetchAllUsers();
        assert auth0Users != null;
        for (Auth0DTO auth0User : auth0Users) {
            Auth0 auth0 = new Auth0();
            auth0.setAuth0_id(auth0User.getUser_id());
            auth0.setRole(auth0APIClient.getUserRole(auth0User.getUser_id()));
            auth0Repository.save(auth0);
        }
    }
}
