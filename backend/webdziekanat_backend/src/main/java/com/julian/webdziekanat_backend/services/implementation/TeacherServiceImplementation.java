package com.julian.webdziekanat_backend.services.implementation;

import com.julian.webdziekanat_backend.dto.SubjectGradesEditDTO;
import com.julian.webdziekanat_backend.dto.SubjectTeacherReadDTO;
import com.julian.webdziekanat_backend.model.Person;
import com.julian.webdziekanat_backend.model.Subject;
import com.julian.webdziekanat_backend.repositories.Auth0Repository;
import com.julian.webdziekanat_backend.repositories.StudentToSubjectRepository;
import com.julian.webdziekanat_backend.repositories.SubjectRepository;
import com.julian.webdziekanat_backend.repositories.TeacherRepository;
import com.julian.webdziekanat_backend.services.interfaces.TeacherGradeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherServiceImplementation implements TeacherGradeService {

    private final SubjectRepository subjectRepository;
    private final StudentToSubjectRepository studentToSubjectRepository;
    private final TeacherRepository teacherRepository;
    private final Auth0Repository auth0Repository;

    @Override
    public List<SubjectTeacherReadDTO> getSubjectsFromTeacher(long teacherId) {
        return subjectRepository.findAllByTeacherId(teacherId)
                .stream()
                .map(subject -> new SubjectTeacherReadDTO(
                        subject.getCode(),
                        subject.getName(),
                        subject.getECTS()))
                .toList();
    }

    @Override
    public SubjectGradesEditDTO getStudentsFromSubject(String subjectCode) {
        return new SubjectGradesEditDTO(
                subjectCode,
                subjectRepository.findById(subjectCode)
                        .map(Subject::getName)
                        .orElse(""),
                studentToSubjectRepository.findAllBySubjectCode(subjectCode)
                        .stream()
                        .map(studentToSubject -> new SubjectGradesEditDTO.StudentSubjectDTO(
                                studentToSubject.getStudent().getFirstName(),
                                studentToSubject.getStudent().getLastName(),
                                studentToSubject.getStudent().getIndexNumber(),
                                studentToSubject.getFinalGrade()))
                        .toList()
        );
    }

    @Override
    public void updateFinalGrade(String studentIndex, String subjectCode, double finalGrade) {
        studentToSubjectRepository.findByStudentIndex(studentIndex)
                .stream()
                .filter(studentToSubject -> studentToSubject.getSubject().getCode().equals(subjectCode))
                .findFirst()
                .ifPresent(studentToSubject -> {
                    studentToSubject.setFinalGrade(finalGrade);
                    studentToSubjectRepository.save(studentToSubject);
                });
    }

    @Override
    public Long getTeacherIdByAuth0(String auth0Id) {
        return teacherRepository.findByAuth0(
                auth0Repository.findById(auth0Id).orElse(null))
                .map(Person::getId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found")
        );
    }
}
