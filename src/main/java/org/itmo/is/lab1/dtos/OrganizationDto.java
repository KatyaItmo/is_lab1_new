package org.itmo.is.lab1.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.itmo.is.lab1.entities.OrganizationType;

public class OrganizationDto {

    private Integer id;

    private Integer officialAddressId;

    @Min(value = 1)
    @NotNull
    private long annualTurnover;

    @Min(value = 1)
    private Integer employeesCount;

    @NotNull
    @Min(value = 1)
    private Long rating;

    private OrganizationType type;

    @NotNull
    private Integer postalAddressId;

    public OrganizationDto() {}

    public OrganizationDto(Integer id, Integer officialAddressId, long annualTurnover, Integer employeesCount, Long rating, OrganizationType type, Integer postalAddressId) {
        this.id = id;
        this.officialAddressId = officialAddressId;
        this.annualTurnover = annualTurnover;
        this.employeesCount = employeesCount;
        this.rating = rating;
        this.type = type;
        this.postalAddressId = postalAddressId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getOfficialAddressId() {
        return officialAddressId;
    }

    public void setOfficialAddressId(Integer officialAddressId) {
        this.officialAddressId = officialAddressId;
    }

    public long getAnnualTurnover() {
        return annualTurnover;
    }

    public void setAnnualTurnover(long annualTurnover) {
        this.annualTurnover = annualTurnover;
    }

    public Integer getEmployeesCount() {
        return employeesCount;
    }

    public void setEmployeesCount(Integer employeesCount) {
        this.employeesCount = employeesCount;
    }

    public Long getRating() {
        return rating;
    }

    public void setRating(Long rating) {
        this.rating = rating;
    }

    public OrganizationType getType() {
        return type;
    }

    public void setType(OrganizationType type) {
        this.type = type;
    }

    public Integer getPostalAddressId() {
        return postalAddressId;
    }

    public void setPostalAddressId(Integer postalAddressId) {
        this.postalAddressId = postalAddressId;
    }
}
