package com.julian.webdziekanat_backend.services.interfaces;

import com.julian.webdziekanat_backend.dto.SubjectGradesEditDTO;
import com.julian.webdziekanat_backend.dto.SubjectTeacherReadDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TeacherGradeService {
    List<SubjectTeacherReadDTO> getSubjectsFromTeacher(long teacherId);
    SubjectGradesEditDTO getStudentsFromSubject(String subjectCode);
    void updateFinalGrade(String studentIndex, String subjectCode, double finalGrade);
    Long getTeacherIdByAuth0(String auth0Id);
}
