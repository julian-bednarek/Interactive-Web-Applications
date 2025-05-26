package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubjectTeacherReadDTO {
    private String code;
    private String name;
    private int ECTS;
}
