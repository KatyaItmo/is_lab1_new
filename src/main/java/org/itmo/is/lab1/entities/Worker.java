package org.itmo.is.lab1.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.itmo.is.lab1.converters.ZonedDateTimeConverter;

import java.time.ZonedDateTime;

@Entity
@Table(name = "workers")
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @ManyToOne
    @JoinColumn(name = "coordinates_id", nullable = false)
    private Coordinates coordinates;

    @Column(nullable = false, name = "creation_date")
    @Convert(converter = ZonedDateTimeConverter.class)
    private ZonedDateTime creationTime;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column
    @Min(value = 1)
    private int salary;

    @Column(nullable = false)
    @DecimalMin(value = "0.0", inclusive = false)
    private float rating;

    @Column(nullable = false, name = "start_date")
    @Convert(converter = ZonedDateTimeConverter.class)
    private ZonedDateTime startDate;

    @Column
    @Enumerated(EnumType.STRING)
    private Position position;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    public Worker() {}

    public Worker(Integer id, String name, Coordinates coordinates, ZonedDateTime creationTime, Organization organization, int salary, float rating, ZonedDateTime startDate, Position position, Status status, Person person) {
        this.id = id;
        this.name = name;
        this.coordinates = coordinates;
        this.creationTime = creationTime;
        this.organization = organization;
        this.salary = salary;
        this.rating = rating;
        this.startDate = startDate;
        this.position = position;
        this.status = status;
        this.person = person;
    }

    public Worker(String name, Coordinates coordinates, Organization organization, int salary, float rating, ZonedDateTime startDate, Position position, Status status, Person person) {
        this.name = name;
        this.coordinates = coordinates;
        this.creationTime = makeCreationTime();
        this.organization = organization;
        this.salary = salary;
        this.rating = rating;
        this.startDate = startDate;
        this.position = position;
        this.status = status;
        this.person = person;
    }

    private ZonedDateTime makeCreationTime() {
        return ZonedDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Coordinates getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(Coordinates coordinates) {
        this.coordinates = coordinates;
    }

    public ZonedDateTime getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(ZonedDateTime creationTime) {
        this.creationTime = creationTime;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public int getSalary() {
        return salary;
    }

    public void setSalary(int salary) {
        this.salary = salary;
    }

    public float getRating() {
        return rating;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    public ZonedDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(ZonedDateTime startDate) {
        this.startDate = startDate;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }
}
