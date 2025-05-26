package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PersonDTO {
    private String firstName;
    private String lastName;
    private String fatherName;
    private String PESEL;
    private String eDeliveryMail;
    private long facultyId;
    private String placeOfBirth;
    private AddressDTO address;
    private String phoneNumber;
    private String auth0Id;
    private Long id;
}
