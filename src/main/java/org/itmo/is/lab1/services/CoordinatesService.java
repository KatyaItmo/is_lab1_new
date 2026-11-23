package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.entities.Coordinates;
import org.itmo.is.lab1.repositories.CoordinatesRepository;
import org.itmo.is.lab1.repositories.WorkerRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;
import org.itmo.is.lab1.services.data.EntityType;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.List;

@ApplicationScoped
public class CoordinatesService {

    @Inject
    private CoordinatesRepository coordinatesRepository;

    @Inject
    private WorkerRepository workerRepository;

    @Inject
    private WorkerService workerService;

    public Coordinates createCoordinates(Coordinates coordinates) {
        Coordinates newCoordinates = coordinatesRepository.insert(coordinates);
        if (newCoordinates != null) {
            UpdateWebSocketEndpoint.broadcast("COORDINATES");
        }
        return newCoordinates;
    }

    public List<Coordinates> getAllCoordinates() {
        return coordinatesRepository.findAll();
    }

    public DeleteResult deleteCoordinates(Integer id) {
        long workersCount = workerRepository.countByCoordinatesId(id);

        if (workersCount > 0) {
            return DeleteResult.IN_USE;
        }

        boolean deleted = coordinatesRepository.deleteById(id);

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("COORDINATES");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public List<DependencyReferenceDto> getDependencies(Integer coordinatesId) {
        return workerRepository.findIdsByCoordinatesId(coordinatesId)
                .stream()
                .map(workerId -> new DependencyReferenceDto(EntityType.WORKER, workerId))
                .toList();
    }

    public List<Coordinates> getAllCoordinatesExceptId(Integer excludedId) {
        return coordinatesRepository.findAllExceptId(excludedId);
    }

    public DeleteResult reassignAndDelete(Integer coordinatesId, List<DependencyReferenceDto> updates) {
        if (updates != null) {
            for (DependencyReferenceDto item : updates) {
                if (item.getReplacementId() == null) {
                    throw new IllegalArgumentException("error: replacement Coordinates can't be null");
                }
                if (item.getReplacementId().equals(coordinatesId)) {
                    throw new IllegalArgumentException("error: replacement Coordinates can't be equal to deleted");
                }

                if (item.getEntityType() == EntityType.WORKER) {
                    workerService.updateWorkerCoordinates(item.getEntityId(), item.getReplacementId());
                }
            }
            UpdateWebSocketEndpoint.broadcast("WORKER");
        }

        return deleteCoordinates(coordinatesId);
    }

}
