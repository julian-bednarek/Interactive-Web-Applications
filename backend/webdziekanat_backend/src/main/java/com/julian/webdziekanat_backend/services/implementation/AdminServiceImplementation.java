package com.julian.webdziekanat_backend.services.implementation;

import com.julian.webdziekanat_backend.dto.*;
import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.exceptions.IllegalDeletionAttemptException;
import com.julian.webdziekanat_backend.model.*;
import com.julian.webdziekanat_backend.model.enums.Roles;
import com.julian.webdziekanat_backend.repositories.*;
import com.julian.webdziekanat_backend.services.interfaces.AdminService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImplementation implements AdminService {

    private final StudentRepository studentRepository;
    private final StudentToSubjectRepository studentToSubjectRepository;
    private final TeacherRepository teacherRepository;
    private final FeesRepository feesRepository;
    private final PaymentRepository paymentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final AddressRepository addressRepository;
    private final FieldOfStudyRepository fieldOfStudyRepository;
    private final Auth0Repository auth0Repository;

    @Override
    public void addTeacher(TeacherWriteDTO teacher) {
        if (!auth0Repository.findById(teacher.getAuth0Id())
                .orElseThrow(() -> new EntityNotFoundException("Auth0 user not found"))
                .getRole().equals(Roles.TEACHER)) {
            throw new IllegalArgumentException("Auth0 user is not a teacher");
        }
        Teacher teacherToAdd = handlePerson(teacher, Teacher.class);
        teacherToAdd.setAcademicTitle(teacher.getAcademicTitle());
        teacherToAdd.setSubjects(null);
        teacherRepository.save(teacherToAdd);
    }

    @Override
    public void deleteStudent(String index) {
        studentToSubjectRepository.deleteStudentSubjects(index);
        paymentRepository.deleteByStudentIndex(index);
        studentRepository.deleteByIndex(index);
    }

    @Override
    public void deleteTeacher(Long id) throws IllegalDeletionAttemptException {
        Teacher teacher = teacherRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        if (!teacher.getSubjects().isEmpty()) {
            throw new IllegalDeletionAttemptException("Couldn't delete this record", "Teacher", "subjects");
        } else {
            teacherRepository.deleteById(id);
        }
    }

    @Override
    public void deleteFee(Long id) throws IllegalDeletionAttemptException {
        Fee fee = feesRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Fee not found"));
        if (!paymentRepository.findByFeeId(fee.getId()).isEmpty()) {
            throw new IllegalDeletionAttemptException("Couldn't delete this record", "Fee", "payments");
        } else {
            feesRepository.deleteById(id);
        }
    }

    @Override
    public void changeSubjectTeacher(String code, Long teacherId) {
        subjectRepository.updateSubjectTeacher(code, teacherId);
    }

    @Override
    @Transactional
    public void assignStudentToSubject(String index, String subjectCode, int semester) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Subject subject = subjectRepository.findById(subjectCode).orElseThrow(() -> new EntityNotFoundException("Subject not found"));
        StudentToSubject studentToSubject = new StudentToSubject(null, subject, student, null, semester);
        studentToSubjectRepository.save(studentToSubject);
    }

    @Override
    public void assignFeeToStudent(String index, Long feeId) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Fee fee = feesRepository.findById(feeId).orElseThrow(() -> new EntityNotFoundException("Fee not found"));
        Payment payment = new Payment();
        payment.setFee(fee);
        payment.setStudent(student);
        payment.setSemester(student.getCurrentSemester());
        payment.setPaid(false);
        paymentRepository.save(payment);
    }

    @Override
    public void removeFeeFromStudent(String index, Long feeId) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Fee fee = feesRepository.findById(feeId).orElseThrow(() -> new EntityNotFoundException("Fee not found"));
        Payment payment = paymentRepository.findByStudentIdAndFeeId(student.getId(), fee.getId()).orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        paymentRepository.delete(payment);
    }

    @Override
    public PaymentsDTO getFeesByStudentIndex(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        List<Payment> payments = paymentRepository.findByStudentId(student.getId());
        List<FeeReadDTO> feeDTOs = payments.stream()
                .map(payment -> new FeeReadDTO(
                        payment.getFee().getId(),
                        payment.getFee().getValue(),
                        payment.getFee().getDescription(),
                        payment.getPaid()
                ))
                .toList();
        return new PaymentsDTO(student.getCurrentSemester(), feeDTOs, new FieldOfStudyReadDTO(student.getFieldOfStudy()));
    }

    @Override
    public void setFeePaid(String index, Long feeId) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        Fee fee = feesRepository.findById(feeId).orElseThrow(() -> new EntityNotFoundException("Fee not found"));
        Payment payment = paymentRepository.findByStudentIdAndFeeId(student.getId(), fee.getId()).orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        payment.setPaid(true);
        System.out.println("Payment status updated to paid");
        paymentRepository.save(payment);
        Payment updatedPayment = paymentRepository.findByStudentIdAndFeeId(student.getId(), fee.getId()).orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        System.out.println("Updated payment status: " + updatedPayment.getPaid());
    }

    @Override
    public void removeStudentFromSubject(String index, String subjectCode, int semester) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        StudentToSubject studentToSubject = studentToSubjectRepository.findByStudentId(student.getId()).stream()
                .filter(sts -> sts.getSubject().getCode().equals(subjectCode) && sts.getSemester() == semester)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Student to subject relation not found"));
        studentToSubjectRepository.delete(studentToSubject);
    }

    @Override
    public void deleteSubject(String subjectCode) throws IllegalDeletionAttemptException {
        Subject subject = subjectRepository.findById(subjectCode).orElseThrow(() -> new EntityNotFoundException("Subject not found"));
        if (!subject.getStudentToSubjects().isEmpty()) {
            throw new IllegalDeletionAttemptException("Couldn't delete this record", "Subject", "students");
        } else {
            subjectRepository.deleteById(subjectCode);
        }
    }

    @Override
    public void addFee(FeeWriteDTO fee) {
        Fee feeToAdd = new Fee();
        feeToAdd.setDescription(fee.getDescription());
        feeToAdd.setValue(fee.getAmount());
        Faculty faculty = facultyRepository.findById(fee.getFacultyId()).orElseThrow(() -> new EntityNotFoundException("Faculty not found"));
        feeToAdd.setFaculty(faculty);
        feesRepository.save(feeToAdd);
    }

    @Override
    public void addSubject(SubjectWriteDTO subject) {
        Subject subjectToAdd = new Subject();
        subjectToAdd.setCode(subject.getCode());
        subjectToAdd.setName(subject.getName());
        subjectToAdd.setECTS(subject.getECTS());
        Teacher teacher = teacherRepository.findById(subject.getTeacherId()).orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        subjectToAdd.setTeacher(teacher);
        subjectRepository.save(subjectToAdd);
    }

    private Address handleAddress(PersonDTO student) {
        Address address = addressRepository.findSpecificAddress(student.getAddress().getStreet(),
                student.getAddress().getHouseNumber(),
                student.getAddress().getFlatNumber(),
                student.getAddress().getPostalCode(),
                student.getAddress().getCity(),
                student.getAddress().getVoivodeship());
        if (address == null) {
            address = new Address();
            address.setStreet(student.getAddress().getStreet());
            address.setHouseNumber(student.getAddress().getHouseNumber());
            address.setFlatNumber(student.getAddress().getFlatNumber());
            address.setPostalCode(student.getAddress().getPostalCode());
            address.setCity(student.getAddress().getCity());
            address.setVoivodeship(student.getAddress().getVoivodeship());
            address = addressRepository.save(address);
        }
        return address;
    }

    private <T extends Person> T handlePerson(PersonDTO personDTO, Class<T> personClass) {
        try {
            T person = personClass.getDeclaredConstructor().newInstance();
            person.setFirstName(personDTO.getFirstName());
            person.setLastName(personDTO.getLastName());
            person.setFatherName(personDTO.getFatherName());
            person.setPESEL(personDTO.getPESEL());
            person.setEDeliveryEmail(personDTO.getEDeliveryMail());
            person.setPhoneNumber(personDTO.getPhoneNumber());
            person.setAuth0(auth0Repository.findById(personDTO.getAuth0Id())
                    .orElseThrow(() -> new EntityNotFoundException("Auth0 user not found")));
            Faculty faculty = facultyRepository.findById(personDTO.getFacultyId())
                    .orElseThrow(() -> new EntityNotFoundException("Faculty not found"));
            person.setFaculty(faculty);
            person.setPlaceOfBirth(personDTO.getPlaceOfBirth());
            person.setAddress(handleAddress(personDTO));
            return person;
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException("Failed to create person instance", e);
        }
    }

    @Override
    public void addStudent(StudentWriteDTO student) {
        if (!auth0Repository.findById(student.getAuth0Id())
                .orElseThrow(() -> new EntityNotFoundException("Auth0 user not found"))
                .getRole().equals(Roles.STUDENT)) {
            throw new IllegalArgumentException("Auth0 user is not a student");
        }
        Student studentToAdd = handlePerson(student, Student.class);
        studentToAdd.setIndexNumber(student.getIndexNumber());
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(student.getFieldOfStudy()).orElseThrow(() -> new EntityNotFoundException("Field of study not found"));
        studentToAdd.setFieldOfStudy(fieldOfStudy);
        studentToAdd.setCurrentSemester(student.getSemester());
        studentToAdd.setDepositAccountNumber(student.getDepositNumber());
        studentToAdd.setWithdrawalAccountNumber(null);
        studentToAdd.setECTSpointsCollected(0);
        studentToAdd.setECTSpointsToBeCollected(0);
        studentToAdd.setPayments(null);
        studentToAdd.setStudentToSubjects(null);
        studentRepository.save(studentToAdd);
    }

    @Override
    public List<SubjectWriteDTO> getSubjectsByStudentIndex(String index) {
        Student student = studentRepository.findByIndexNumber(index).orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return studentToSubjectRepository.findByStudentId(student.getId()).stream()
                .map(sts -> new SubjectWriteDTO(sts.getSubject().getCode(), sts.getSubject().getName(), sts.getSubject().getECTS(), sts.getSubject().getTeacher().getId()))
                .toList();
    }

    @Override
    public void updateFee(Long id, FeeWriteDTO fee) {
        Fee feeToUpdate = feesRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Fee not found"));
        feeToUpdate.setDescription(fee.getDescription());
        feeToUpdate.setValue(fee.getAmount());
        Faculty faculty = facultyRepository.findById(fee.getFacultyId()).orElseThrow(() -> new EntityNotFoundException("Faculty not found"));
        feeToUpdate.setFaculty(faculty);
        feesRepository.save(feeToUpdate);
    }

    @Override
    public void updateSubject(String code, SubjectWriteDTO subject) {
        Subject subjectToUpdate = subjectRepository.findById(code).orElseThrow(() -> new EntityNotFoundException("Subject not found"));
        subjectToUpdate.setName(subject.getName());
        subjectToUpdate.setECTS(subject.getECTS());
        Teacher teacher = teacherRepository.findById(subject.getTeacherId()).orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        subjectToUpdate.setTeacher(teacher);
        subjectRepository.save(subjectToUpdate);
    }

    @Override
    public List<Auth0DTO> getNotFilledUsers() {
        return auth0Repository.findNotFilledUsers().stream()
                .map(auth0 -> new Auth0DTO(auth0.getUser_id(), auth0.getRole()))
                .toList();
    }

    @Override
    public List<SubjectWriteDTO> getSubjects() {
        return subjectRepository.findAll().stream()
                .map(subject -> new SubjectWriteDTO(subject.getCode(), subject.getName(), subject.getECTS(), subject.getTeacher().getId()))
                .toList();
    }

    @Override
    public List<FeeWriteDTO> getFees() {
        System.out.println("Fetching all fees");
        return feesRepository.findAll().stream()
                .map(fee -> new FeeWriteDTO(fee.getDescription(), fee.getFaculty().getId(), fee.getValue(), fee.getId()))
                .toList();
    }

    @Override
    public List<StudentWriteDTO> getStudents() {
        return studentRepository.findAll().stream()
                .map(StudentWriteDTO::new)
                .toList();
    }

    @Override
    public List<TeacherWriteDTO> getTeachers() {
        return teacherRepository.findAll().stream()
                .map(TeacherWriteDTO::new)
                .toList();
    }

    @Override
    public void deleteFieldOfStudy(Long id) throws IllegalDeletionAttemptException {
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Field of study not found"));
        if (!fieldOfStudy.getStudents().isEmpty()) {
            throw new IllegalDeletionAttemptException("Couldn't delete this record", "Field of study", "students");
        } else {
            fieldOfStudyRepository.deleteById(id);
        }
    }

    @Override
    public void updateFieldOfStudy(Long id, FieldOfStudyWriteDTO fieldOfStudy) {
        FieldOfStudy fieldOfStudyToUpdate = fieldOfStudyRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Field of study not found"));
        fieldOfStudyToUpdate.setName(fieldOfStudy.getName());
        fieldOfStudyToUpdate.setDegree(fieldOfStudy.getDegree());
        fieldOfStudyToUpdate.setFormOfStudy(fieldOfStudy.getFormOfStudy());
        fieldOfStudyToUpdate.setLengthOfStudy(fieldOfStudy.getDuration());
        Faculty faculty = facultyRepository.findById(fieldOfStudy.getFacultyId()).orElseThrow(() -> new EntityNotFoundException("Faculty not found"));
        fieldOfStudyToUpdate.setFaculty(faculty);
        fieldOfStudyRepository.save(fieldOfStudyToUpdate);
    }

    @Override
    public void addFieldOfStudy(FieldOfStudyWriteDTO fieldOfStudy) {
        FieldOfStudy fieldOfStudyToAdd = new FieldOfStudy();
        fieldOfStudyToAdd.setName(fieldOfStudy.getName());
        fieldOfStudyToAdd.setDegree(fieldOfStudy.getDegree());
        fieldOfStudyToAdd.setFormOfStudy(fieldOfStudy.getFormOfStudy());
        fieldOfStudyToAdd.setLengthOfStudy(fieldOfStudy.getDuration());
        Faculty faculty = facultyRepository.findById(fieldOfStudy.getFacultyId()).orElseThrow(() -> new EntityNotFoundException("Faculty not found"));
        fieldOfStudyToAdd.setFaculty(faculty);
        fieldOfStudyRepository.save(fieldOfStudyToAdd);
    }

    @Override
    public List<FieldOfStudyReadDTO> getFieldsOfStudy() {
        return fieldOfStudyRepository.findAll().stream()
                .map(FieldOfStudyReadDTO::new)
                .toList();
    }
}
