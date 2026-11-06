package org.itmo.is.lab1.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "official_address_id")
    private Address officialAddress;

    @Column
    @Min(value = 1)
    private long annualTurnover;

    @Column
    private Integer employeesCount;

    @Column(nullable = false)
    @Min(value = 1)
    private Long rating;

    @Column
    @Enumerated(EnumType.STRING)
    private OrganizationType Type;

    @ManyToOne
    @JoinColumn(name = "postal_address_id", nullable = false)
    private Address postalAddress;

    public Organization() {}

    public Organization(Integer id, Address officialAddress, long annualTurnover, Integer employeesCount, Long rating, OrganizationType type, Address postalAddress) {
        this.id = id;
        this.officialAddress = officialAddress;
        this.annualTurnover = annualTurnover;
        this.employeesCount = employeesCount;
        this.rating = rating;
        Type = type;
        this.postalAddress = postalAddress;
    }

    public Organization(Address officialAddress, long annualTurnover, Integer employeesCount, Long rating, OrganizationType type, Address postalAddress) {
        this.officialAddress = officialAddress;
        this.annualTurnover = annualTurnover;
        this.employeesCount = employeesCount;
        this.rating = rating;
        Type = type;
        this.postalAddress = postalAddress;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Address getOfficialAddress() {
        return officialAddress;
    }

    public void setOfficialAddress(Address officialAddress) {
        this.officialAddress = officialAddress;
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
        return Type;
    }

    public void setType(OrganizationType type) {
        Type = type;
    }

    public Address getPostalAddress() {
        return postalAddress;
    }

    public void setPostalAddress(Address postalAddress) {
        this.postalAddress = postalAddress;
    }
}
