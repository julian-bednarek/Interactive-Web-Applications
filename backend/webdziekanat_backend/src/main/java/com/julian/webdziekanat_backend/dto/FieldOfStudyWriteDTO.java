package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.FieldOfStudy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldOfStudyWriteDTO {
    private String name;
    private long facultyId;
    private String degree;
    private int duration;
    private String formOfStudy;
    private Long fieldOfStudyId;

    public FieldOfStudyWriteDTO(FieldOfStudy fieldOfStudy) {
        this.name = fieldOfStudy.getName();
        this.facultyId = fieldOfStudy.getFaculty().getId();
        this.degree = fieldOfStudy.getDegree();
        this.duration = fieldOfStudy.getLengthOfStudy();
        this.formOfStudy = fieldOfStudy.getFormOfStudy();
    }
}
