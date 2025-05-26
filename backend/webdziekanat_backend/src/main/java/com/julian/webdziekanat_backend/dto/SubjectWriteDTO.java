package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.Teacher;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubjectWriteDTO {
    private String code;
    private String name;
    private int ECTS;
    private long teacherId;
}
