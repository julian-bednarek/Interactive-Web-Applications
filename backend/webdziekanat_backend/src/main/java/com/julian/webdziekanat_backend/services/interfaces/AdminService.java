package com.julian.webdziekanat_backend.services.interfaces;

import com.julian.webdziekanat_backend.dto.*;
import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.exceptions.IllegalDeletionAttemptException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminService {
    void deleteStudent(String index);
    void deleteTeacher(Long id) throws IllegalDeletionAttemptException;
    void deleteFee(Long id) throws IllegalDeletionAttemptException;
    void deleteSubject(String subjectCode) throws IllegalDeletionAttemptException;
    void addFee(FeeWriteDTO fee);
    void addSubject(SubjectWriteDTO subject);
    void addStudent(StudentWriteDTO student);
    void addTeacher(TeacherWriteDTO teacher);
    void updateFee(Long id, FeeWriteDTO fee);
    void updateSubject(String code, SubjectWriteDTO subject);
    void changeSubjectTeacher(String code, Long teacherId);
    void assignStudentToSubject(String index, String subjectCode, int semester);
    void removeStudentFromSubject(String index, String subjectCode, int semester);
    void deleteFieldOfStudy(Long id) throws IllegalDeletionAttemptException;
    void updateFieldOfStudy(Long id, FieldOfStudyWriteDTO fieldOfStudy);
    void addFieldOfStudy(FieldOfStudyWriteDTO fieldOfStudy);
    void assignFeeToStudent(String index, Long feeId);
    void removeFeeFromStudent(String index, Long feeId);
    void setFeePaid(String index, Long feeId);
    PaymentsDTO getFeesByStudentIndex(String index);
    List<FieldOfStudyReadDTO> getFieldsOfStudy();
    List<Auth0DTO> getNotFilledUsers();
    List<SubjectWriteDTO> getSubjects();
    List<FeeWriteDTO> getFees();
    List<StudentWriteDTO> getStudents();
    List<TeacherWriteDTO> getTeachers();
    List<SubjectWriteDTO> getSubjectsByStudentIndex(String index);
}
