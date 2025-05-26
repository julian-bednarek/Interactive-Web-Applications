package com.julian.webdziekanat_backend.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public enum Roles {
    ADMIN("admin"),
    STUDENT("student"),
    TEACHER("teacher");

    private String name;

    public static Roles fromString(String role) {
        for (Roles r : Roles.values()) {
            if (r.name.equalsIgnoreCase(role)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + role);
    }
}
