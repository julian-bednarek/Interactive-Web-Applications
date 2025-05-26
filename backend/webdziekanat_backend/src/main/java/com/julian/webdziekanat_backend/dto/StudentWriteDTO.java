package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.Student;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class StudentWriteDTO extends PersonDTO {
    private String indexNumber;
    private long fieldOfStudy;
    private int semester;
    private String depositNumber;

    public StudentWriteDTO(Student student) {
        super(student.getFirstName(), student.getLastName(), student.getFatherName(), student.getPESEL(), student.getEDeliveryEmail(), student.getFaculty().getId(), student.getPlaceOfBirth(), new AddressDTO(student.getAddress()), student.getPhoneNumber(), student.getAuth0().getAuth0_id(), student.getId());
        this.indexNumber = student.getIndexNumber();
        this.fieldOfStudy = student.getFieldOfStudy().getId();
        this.semester = student.getCurrentSemester();
        this.depositNumber = student.getDepositAccountNumber();
    }
}
