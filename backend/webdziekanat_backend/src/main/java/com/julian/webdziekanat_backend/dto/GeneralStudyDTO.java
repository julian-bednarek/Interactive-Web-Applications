package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class GeneralStudyDTO {
    private int currentSemester;
    private FieldOfStudyReadDTO fieldOfStudyInfo;
    private String yearlyRegistration;
    private double averageGrade;
    private double averageSemesterGrade;
    private int ECTScollected;
    private int ECTSrequired;
}
