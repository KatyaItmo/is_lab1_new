package org.itmo.is.lab1.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.itmo.is.lab1.entities.Color;
import org.itmo.is.lab1.entities.Country;

import java.time.OffsetDateTime;

public class PersonDto {

    private Integer id;

    @NotNull
    private Color eyeColor;

    private Color hairColor;

    @NotNull
    private Integer locationId;

    @NotNull
    private OffsetDateTime birthday;

    @NotNull
    @Min(value = 1)
    private Integer height;

    @NotBlank
    @Size(min = 8)
    private String passportId;

    private Country nationality;

    public PersonDto() {}

    public PersonDto(Integer id, Color eyeColor, Color hairColor, Integer locationId, OffsetDateTime birthday, Integer height, String passportId, Country nationality) {
        this.id = id;
        this.eyeColor = eyeColor;
        this.hairColor = hairColor;
        this.locationId = locationId;
        this.birthday = birthday;
        this.height = height;
        this.passportId = passportId;
        this.nationality = nationality;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Color getEyeColor() {
        return eyeColor;
    }

    public void setEyeColor(Color eyeColor) {
        this.eyeColor = eyeColor;
    }

    public Color getHairColor() {
        return hairColor;
    }

    public void setHairColor(Color hairColor) {
        this.hairColor = hairColor;
    }

    public Integer getLocationId() {
        return locationId;
    }

    public void setLocationId(Integer locationId) {
        this.locationId = locationId;
    }

    public OffsetDateTime getBirthday() {
        return birthday;
    }

    public void setBirthday(OffsetDateTime birthday) {
        this.birthday = birthday;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getPassportId() {
        return passportId;
    }

    public void setPassportId(String passportId) {
        this.passportId = passportId;
    }

    public Country getNationality() {
        return nationality;
    }

    public void setNationality(Country nationality) {
        this.nationality = nationality;
    }
}
