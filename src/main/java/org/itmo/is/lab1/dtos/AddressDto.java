package org.itmo.is.lab1.dtos;

import jakarta.validation.constraints.NotBlank;

public class AddressDto {

    private Integer id;

    @NotBlank
    private String street;

    private Integer townId;

    public AddressDto() {}

    public AddressDto(Integer id, String street, Integer townId) {
        this.id = id;
        this.street = street;
        this.townId = townId;
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

    public Integer getTownId() {
        return townId;
    }

    public void setTownId(Integer townId) {
        this.townId = townId;
    }
}
