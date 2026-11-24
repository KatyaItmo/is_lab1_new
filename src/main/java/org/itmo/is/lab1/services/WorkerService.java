package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.WorkerDto;
import org.itmo.is.lab1.entities.*;
import org.itmo.is.lab1.repositories.CoordinatesRepository;
import org.itmo.is.lab1.repositories.OrganizationRepository;
import org.itmo.is.lab1.repositories.PersonRepository;
import org.itmo.is.lab1.repositories.WorkerRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class WorkerService {

    @Inject
    private WorkerRepository workerRepository;

    @Inject
    private CoordinatesRepository coordinatesRepository;

    @Inject
    private OrganizationRepository organizationRepository;

    @Inject
    private PersonRepository personRepository;

    public Worker getWorkerById(Integer id) {
        return workerRepository.findById(id).orElse(null);
    }

    public List<WorkerDto> getWorkers(String filteredValue, String sortOrder, int page, int size) {
        boolean ascending = !"desc".equalsIgnoreCase(sortOrder);
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;
        int skip = safePage * safeSize;

        return workerRepository.findAll(filteredValue, ascending, skip, safeSize)
                .stream()
                .map(worker -> new WorkerDto(
                        worker.getId(),
                        worker.getName(),
                        worker.getCoordinates().getId(),
                        worker.getCreationTime().toOffsetDateTime(),
                        worker.getOrganization() != null ? worker.getOrganization().getId() : null,
                        worker.getSalary(),
                        worker.getRating(),
                        worker.getStartDate().toOffsetDateTime(),
                        worker.getPosition(),
                        worker.getStatus(),
                        worker.getPerson().getId()
                ))
                .toList();
    }

    public long countFilteredWorkers(String filteredValue) {
        return workerRepository.countAll(filteredValue);
    }

    public double getAverageRating() {
        return workerRepository.getAverageRating();
    }

    public long countByStatusLessThan(Status status) {
        return workerRepository.countByStatusLessThan(status);
    }

    public List<Status> getDistinctStatuses() {
        return workerRepository.findDistinctStatuses();
    }

    public Worker indexSalary(Integer id, int coefficient) {
        if (coefficient <= 0) {
            throw new IllegalArgumentException("error: coefficient must be greater than 0");
        }

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + id + " not found"));

        worker.setSalary(worker.getSalary() * coefficient);

        UpdateWebSocketEndpoint.broadcast("WORKER");

        return workerRepository.update(worker);
    }

    public Worker createWorker(WorkerDto dto) {
        if (dto.getStatus() == Status.FIRED) {
            throw new IllegalArgumentException("error: cannot create worker with status FIRED");
        }
        if (dto.getOrganizationId() == null) {
            throw new IllegalArgumentException("error: organization cannot be null when creating worker");
        }

        Organization organization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("error: organization with id=" + dto.getOrganizationId() + " not found"));

        Worker worker = new Worker(
                dto.getName(),
                coordinatesRepository.findById(dto.getCoordinatesId())
                        .orElseThrow(() -> new RuntimeException("error: coordinates with id=" + dto.getCoordinatesId() + " not found")),
                organization,
                dto.getSalary(),
                dto.getRating(),
                dto.getStartDate().toZonedDateTime(),
                dto.getPosition(),
                dto.getStatus(),
                personRepository.findById(dto.getPersonId())
                        .orElseThrow(() -> new RuntimeException("error: person with id=" + dto.getPersonId() + " not found"))
        );

        Worker created = workerRepository.insert(worker);

        incrementEmployeesCount(organization);

        UpdateWebSocketEndpoint.broadcast("WORKER");
        UpdateWebSocketEndpoint.broadcast("ORGANIZATION");

        return created;
    }

    public Worker updateWorker(WorkerDto dto) {
        if (dto.getStatus() == Status.FIRED) {
            throw new IllegalArgumentException("error: cannot set status FIRED via update; use fire endpoint instead");
        }
        if (dto.getOrganizationId() == null) {
            throw new IllegalArgumentException("error: organization cannot be null when updating worker");
        }

        Worker existingWorker = workerRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + dto.getId() + " not found"));

        Organization oldOrganization = existingWorker.getOrganization();
        Organization newOrganization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("error: organization with id=" + dto.getOrganizationId() + " not found"));

        Worker worker = new Worker(
                dto.getId(),
                dto.getName(),
                coordinatesRepository.findById(dto.getCoordinatesId())
                        .orElseThrow(() -> new RuntimeException("error: coordinates with id=" + dto.getCoordinatesId() + " not found")),
                dto.getCreationTime() != null ? dto.getCreationTime().toZonedDateTime() : existingWorker.getCreationTime(),
                newOrganization,
                dto.getSalary(),
                dto.getRating(),
                dto.getStartDate().toZonedDateTime(),
                dto.getPosition(),
                dto.getStatus(),
                personRepository.findById(dto.getPersonId())
                        .orElseThrow(() -> new RuntimeException("error: person with id=" + dto.getPersonId() + " not found"))
        );

        Worker updated = workerRepository.update(worker);

        if (oldOrganization == null) {
            incrementEmployeesCount(newOrganization);
        } else if (!oldOrganization.getId().equals(newOrganization.getId())) {
            decrementEmployeesCount(oldOrganization);
            incrementEmployeesCount(newOrganization);
        }

        UpdateWebSocketEndpoint.broadcast("WORKER");
        UpdateWebSocketEndpoint.broadcast("ORGANIZATION");

        return updated;
    }

    public DeleteResult deleteWorker(Integer id) {
        Optional<Worker> workerOpt = workerRepository.findById(id);
        if (workerOpt.isEmpty()) {
            return DeleteResult.NOT_FOUND;
        }

        Organization organization = workerOpt.get().getOrganization();
        boolean deleted = workerRepository.deleteById(id);

        if (deleted && organization != null) {
            decrementEmployeesCount(organization);
        }

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("WORKER");
            UpdateWebSocketEndpoint.broadcast("ORGANIZATION");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public Worker fireWorker(Integer id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + id + " not found"));

        if (worker.getStatus() == Status.FIRED && worker.getOrganization() == null) {
            return worker;
        }

        Organization organization = worker.getOrganization();

        worker.setStatus(Status.FIRED);
        worker.setOrganization(null);

        Worker updated = workerRepository.update(worker);

        if (organization != null) {
            decrementEmployeesCount(organization);
        }

        UpdateWebSocketEndpoint.broadcast("WORKER");
        UpdateWebSocketEndpoint.broadcast("ORGANIZATION");

        return updated;
    }

    private void incrementEmployeesCount(Organization organization) {
        Integer current = organization.getEmployeesCount();
        organization.setEmployeesCount(current == null ? 1 : current + 1);
        organizationRepository.update(organization);
    }

    private void decrementEmployeesCount(Organization organization) {
        Integer current = organization.getEmployeesCount();
        if (current == null || current <= 1) {
            organization.setEmployeesCount(null);
        } else {
            organization.setEmployeesCount(current - 1);
        }
        organizationRepository.update(organization);
    }

    public void updateWorkerCoordinates(Integer workerId, Integer newCoordinatesId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + workerId + " not found"));

        Coordinates newCoordinates = coordinatesRepository.findById(newCoordinatesId)
                .orElseThrow(() -> new RuntimeException("error: coordinates with id=" + newCoordinatesId + " not found"));

        worker.setCoordinates(newCoordinates);
        workerRepository.update(worker);
    }

    public void updateWorkerOrganization(Integer workerId, Integer newOrganizationId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + workerId + " not found"));

        Organization newOrg = null;
        if (newOrganizationId != null) {
            newOrg = organizationRepository.findById(newOrganizationId)
                    .orElseThrow(() -> new RuntimeException("error: organization with id=" + newOrganizationId + " not found"));
        }

        worker.setOrganization(newOrg);
        workerRepository.update(worker);

        if (newOrg != null) {
            incrementEmployeesCount(newOrg);
        }
    }

    public void updateWorkerPerson(Integer workerId, Integer newPersonId) {
        if (newPersonId == null) {
            throw new IllegalArgumentException("error: person cannot be null for worker");
        }

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("error: worker with id=" + workerId + " not found"));

        Person newPerson = personRepository.findById(newPersonId)
                .orElseThrow(() -> new RuntimeException("error: person with id=" + newPersonId + " not found"));

        worker.setPerson(newPerson);
        workerRepository.update(worker);
    }
}