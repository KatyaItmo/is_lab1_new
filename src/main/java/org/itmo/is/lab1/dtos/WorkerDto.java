package org.itmo.is.lab1.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.itmo.is.lab1.entities.Position;
import org.itmo.is.lab1.entities.Status;

import java.time.OffsetDateTime;

public class WorkerDto {

    private Integer id;

    @NotBlank
    private String name;

    @NotNull
    private Integer coordinatesId;

    private OffsetDateTime creationTime;

    private Integer organizationId;

    @Min(value = 1)
    private int salary;

    @DecimalMin(value = "0.0", inclusive = false)
    private float rating;

    @NotNull
    private OffsetDateTime startDate;

    private Position position;

    @NotNull
    private Status status;

    @NotNull
    private Integer personId;

    public WorkerDto() {}

    public WorkerDto(Integer id, String name, Integer coordinatesId, OffsetDateTime creationTime, Integer organizationId, int salary, float rating, OffsetDateTime startDate, Position position, Status status, Integer personId) {
        this.id = id;
        this.name = name;
        this.coordinatesId = coordinatesId;
        this.creationTime = creationTime;
        this.organizationId = organizationId;
        this.salary = salary;
        this.rating = rating;
        this.startDate = startDate;
        this.position = position;
        this.status = status;
        this.personId = personId;
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

    public Integer getCoordinatesId() {
        return coordinatesId;
    }

    public void setCoordinatesId(Integer coordinatesId) {
        this.coordinatesId = coordinatesId;
    }

    public OffsetDateTime getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(OffsetDateTime creationTime) {
        this.creationTime = creationTime;
    }

    public Integer getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Integer organizationId) {
        this.organizationId = organizationId;
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

    public OffsetDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(OffsetDateTime startDate) {
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

    public Integer getPersonId() {
        return personId;
    }

    public void setPersonId(Integer personId) {
        this.personId = personId;
    }
}
