package org.itmo.is.lab1.dtos;

import jakarta.validation.constraints.NotBlank;

public class AddressDto {

    private Integer id;

    @NotBlank
    private String street;

    private Integer locationId;

    public AddressDto() {}

    public AddressDto(Integer id, String street, Integer locationId) {
        this.id = id;
        this.street = street;
        this.locationId = locationId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public Integer getLocationId() {
        return locationId;
    }

    public void setLocationId(Integer locationId) {
        this.locationId = locationId;
    }
}
