package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.dtos.WorkerDto;
import org.itmo.is.lab1.entities.Worker;
import org.itmo.is.lab1.repositories.CoordinatesRepository;
import org.itmo.is.lab1.repositories.OrganizationRepository;
import org.itmo.is.lab1.repositories.PersonRepository;
import org.itmo.is.lab1.repositories.WorkerRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class WorkerService {

    @Inject
    private WorkerRepository workerRepository;

    @Inject
    private CoordinatesRepository coordinatesRepository;

    @Inject
    private OrganizationRepository organizationRepository;

    @Inject
    private PersonRepository personRepository;

    public Worker createWorker(WorkerDto dto) {
        Worker worker = new Worker(
                dto.getName(),
                coordinatesRepository.findById(dto.getCoordinatesId()).orElse(null),
                organizationRepository.findById(dto.getOrganizationId()).orElse(null),
                dto.getSalary(),
                dto.getRating(),
                dto.getStartDate().toZonedDateTime(),
                dto.getPosition(),
                dto.getStatus(),
                personRepository.findById(dto.getPersonId()).orElse(null)
        );

        return workerRepository.insert(worker);
    }

    public List<WorkerDto> getAllWorkers() {
        return workerRepository.findAll()
                .map(worker -> new WorkerDto(
                        worker.getId(),
                        worker.getName(),
                        worker.getCoordinates().getId(),
                        worker.getCreationTime().toOffsetDateTime(),
                        worker.getOrganization().getId(),
                        worker.getSalary(),
                        worker.getRating(),
                        worker.getStartDate().toOffsetDateTime(),
                        worker.getPosition(),
                        worker.getStatus(),
                        worker.getPerson().getId()
                ))
                .toList();
    }

    public Worker getWorkerById(Integer id) {
        return workerRepository.findById(id).orElse(null);
    }

    public boolean updateWorker(WorkerDto dto) {
        Worker worker = new Worker(
                dto.getId(),
                dto.getName(),
                coordinatesRepository.findById(dto.getCoordinatesId()).orElse(null),
                dto.getCreationTime().toZonedDateTime(),
                organizationRepository.findById(dto.getOrganizationId()).orElse(null),
                dto.getSalary(),
                dto.getRating(),
                dto.getStartDate().toZonedDateTime(),
                dto.getPosition(),
                dto.getStatus(),
                personRepository.findById(dto.getPersonId()).orElse(null)
        );

        return workerRepository.update(worker);
    }

    public void deleteWorker(Integer id) {
        workerRepository.deleteById(id);
    }
}
