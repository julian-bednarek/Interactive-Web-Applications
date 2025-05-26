package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.Address;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AddressDTO {
    private String street;
    private String houseNumber;
    private Integer flatNumber;
    private String postalCode;
    private String city;
    private String voivodeship;
    private boolean confirmed;

    public AddressDTO(Address address) {
        this.street = address.getStreet();
        this.houseNumber = address.getHouseNumber();
        this.flatNumber = address.getFlatNumber();
        this.postalCode = address.getPostalCode();
        this.city = address.getCity();
        this.voivodeship = address.getVoivodeship();
        this.confirmed = address.isConfirmed();
    }
}
