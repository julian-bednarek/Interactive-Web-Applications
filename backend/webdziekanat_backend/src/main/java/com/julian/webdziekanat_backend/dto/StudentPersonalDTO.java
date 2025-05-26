package com.julian.webdziekanat_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class StudentPersonalDTO {
    @JsonProperty("firstName")
    private String name;
    @JsonProperty("lastName")
    private String surname;
    private String fatherName;
    @JsonProperty("PESEL")
    private String PESEL;
    private String placeOfBirth;
    private String phoneNumber;
    private String eDeliveryEmail;
    private AddressDTO address;
}
