package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SubjectGradesEditDTO {
    private String subjectCode;
    private String subjectName;
    @Data
    @AllArgsConstructor
    public static class StudentSubjectDTO {
        private String studentName;
        private String studentSurname;
        private String studentIndexNumber;
        private Double finalGrade;
    }
    private List<StudentSubjectDTO> students;
}
