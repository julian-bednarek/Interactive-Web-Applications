package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubjectReadDTO {
    private String code;
    private String name;
    private int ECTS;
    private String teacher;
    private Double finalGrade;
}
