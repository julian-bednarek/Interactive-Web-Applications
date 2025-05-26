package com.julian.webdziekanat_backend.model;

import com.julian.webdziekanat_backend.model.enums.Roles;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Auth0 {
    @Id
    private String auth0_id;
    private Roles role;
}
