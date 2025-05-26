package com.julian.webdziekanat_backend.services.implementation;

import com.julian.webdziekanat_backend.dto.*;
import com.julian.webdziekanat_backend.model.Address;
import com.julian.webdziekanat_backend.model.Student;
import com.julian.webdziekanat_backend.model.StudentToSubject;
import com.julian.webdziekanat_backend.model.Teacher;
import com.julian.webdziekanat_backend.repositories.Auth0Repository;
import com.julian.webdziekanat_backend.repositories.StudentRepository;
import com.julian.webdziekanat_backend.repositories.StudentToSubjectRepository;
import com.julian.webdziekanat_backend.repositories.TeacherRepository;
import com.julian.webdziekanat_backend.services.interfaces.StudentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class StudentServiceImplementation implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentToSubjectRepository studentToSubjectRepository;
    private final TeacherRepository teacherRepository;
    private final Auth0Repository auth0Repository;

    @Override
    public StudentBankAccountsDTO getStudentBankAccounts(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return new StudentBankAccountsDTO(
                student.getDepositAccountNumber(),
                student.getWithdrawalAccountNumber()
        );
    }

    @Override
    public void updateStudentBankAccounts(String index, StudentBankAccountsDTO studentBankAccountsDTO) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        student.setWithdrawalAccountNumber(studentBankAccountsDTO.getWithdrawalAccount());
        studentRepository.save(student);
    }

    @Override
    public ReportCardDTO getStudentSubjects(String index, int semester) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        ReportCardDTO reportCardDTO = new ReportCardDTO();
        reportCardDTO.setSemester(semester);
        List<StudentToSubject> studentToSubjects = studentToSubjectRepository.findAllByStudentAndSemester(student, semester);
        List<SubjectReadDTO> subjects = getSubjectReadDTOS(studentToSubjects);
        reportCardDTO.setSubjects(subjects);
        return reportCardDTO;
    }

    private static List<SubjectReadDTO> getSubjectReadDTOS(List<StudentToSubject> studentToSubjects) {
        List<SubjectReadDTO> subjects = new ArrayList<>();
        for (StudentToSubject studentToSubject : studentToSubjects) {
            SubjectReadDTO subjectReadDTO = new SubjectReadDTO();
            subjectReadDTO.setCode(studentToSubject.getSubject().getCode());
            subjectReadDTO.setName(studentToSubject.getSubject().getName());
            subjectReadDTO.setECTS(studentToSubject.getSubject().getECTS());
            subjectReadDTO.setFinalGrade(studentToSubject.getFinalGrade());
            Teacher teacher = studentToSubject.getSubject().getTeacher();
            subjectReadDTO.setTeacher("%s %s %s".formatted(teacher.getAcademicTitle(), teacher.getFirstName(), teacher.getLastName()));
            subjects.add(subjectReadDTO);
        }
        return subjects;
    }

    @Override
    public StudentPersonalDTO getStudentPersonalData(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Address address = student.getAddress();
        AddressDTO addressDTO = new AddressDTO(
                address.getStreet(),
                address.getHouseNumber(),
                address.getFlatNumber(),
                address.getPostalCode(),
                address.getCity(),
                address.getVoivodeship(),
                address.isConfirmed()
        );
        return new StudentPersonalDTO(
                student.getFirstName(),
                student.getLastName(),
                student.getFatherName(),
                student.getPESEL(),
                student.getPlaceOfBirth(),
                student.getPhoneNumber(),
                student.getEDeliveryEmail(),
                addressDTO
        );
    }

    //TODO: Add validation
    @Override
    public void updateStudentPersonalData(String index, StudentPersonalDTO studentPersonalDTO) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Address address = student.getAddress();
        address.setStreet(studentPersonalDTO.getAddress().getStreet());
        address.setHouseNumber(studentPersonalDTO.getAddress().getHouseNumber());
        address.setFlatNumber(studentPersonalDTO.getAddress().getFlatNumber());
        address.setPostalCode(studentPersonalDTO.getAddress().getPostalCode());
        address.setCity(studentPersonalDTO.getAddress().getCity());
        address.setVoivodeship(studentPersonalDTO.getAddress().getVoivodeship());
        student.setFirstName(studentPersonalDTO.getName());
        student.setLastName(studentPersonalDTO.getSurname());
        student.setFatherName(studentPersonalDTO.getFatherName());
        student.setPESEL(studentPersonalDTO.getPESEL());
        student.setPlaceOfBirth(studentPersonalDTO.getPlaceOfBirth());
        student.setPhoneNumber(studentPersonalDTO.getPhoneNumber());
        student.setEDeliveryEmail(studentPersonalDTO.getEDeliveryEmail());
        studentRepository.save(student);
    }

    @Override
    public String getStudentIndex(String authID) {
        Student student = studentRepository.findByAuth0(auth0Repository.findById(authID)
                        .orElseThrow(() -> new EntityNotFoundException("Auth0 not found")))
                        .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return student.getIndexNumber();
    }

    @Override
    public FieldOfStudyReadDTO getStudentFieldOfStudy(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return new FieldOfStudyReadDTO(
                student.getFieldOfStudy().getName(),
                student.getFieldOfStudy().getFaculty().getName(),
                student.getFieldOfStudy().getDegree(),
                student.getFieldOfStudy().getLengthOfStudy(),
                student.getFieldOfStudy().getFormOfStudy(),
                student.getFieldOfStudy().getId()
        );
    }

    //TODO: Add validation and valid data
    @Override
    public GeneralStudyDTO getStudentGeneralStudy(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return new GeneralStudyDTO(
                student.getCurrentSemester(),
                getStudentFieldOfStudy(index),
                (student.getECTSpointsCollected() == student.getECTSpointsToBeCollected()) ? "Positive" : "Conditional",
                3.0,
                3.0,
                student.getECTSpointsCollected(),
                student.getECTSpointsToBeCollected()
        );
    }

    @Override
    public PaymentsDTO getStudentFees(String index, int semester) {
        Student student = studentRepository.findByIndexNumber(index)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        PaymentsDTO paymentsDTO = new PaymentsDTO();
        paymentsDTO.setSemester(semester);
        paymentsDTO.setFieldOfStudy(getStudentFieldOfStudy(index));

        List<FeeReadDTO> fees = student.getPayments().stream()
                .filter(payment -> payment.getSemester() == semester)
                .map(payment -> new FeeReadDTO(
                        payment.getId(),
                        payment.getFee().getValue(),
                        payment.getFee().getDescription(),
                        payment.getPaid()
                ))
                .collect(Collectors.toList());

        paymentsDTO.setFees(fees);
        return paymentsDTO;
    }

}
