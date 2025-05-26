package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.FieldOfStudy;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FieldOfStudyReadDTO {
    private String name;
    private String faculty;
    private String degree;
    private int duration;
    private String formOfStudy;
    private long fieldOfStudyId;

    public FieldOfStudyReadDTO(FieldOfStudy fieldOfStudy) {
        this.name = fieldOfStudy.getName();
        this.faculty = fieldOfStudy.getFaculty().getName();
        this.degree = fieldOfStudy.getDegree();
        this.duration = fieldOfStudy.getLengthOfStudy();
        this.formOfStudy = fieldOfStudy.getFormOfStudy();
        this.fieldOfStudyId = fieldOfStudy.getId();
    }
}