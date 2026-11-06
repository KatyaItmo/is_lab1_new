package org.itmo.is.lab1.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(nullable = false)
    private String street;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location town;

    public Address() {}

    public Address(Integer id, String street, Location town) {
        this.id = id;
        this.street = street;
        this.town = town;
    }

    public Address(String street, Location town) {
        this.street = street;
        this.town = town;
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

    public Location getTown() {
        return town;
    }

    public void setTown(Location town) {
        this.town = town;
    }
}
