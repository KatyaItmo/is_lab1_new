package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.entities.Coordinates;
import org.itmo.is.lab1.repositories.CoordinatesRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class CoordinatesService {

    @Inject
    private CoordinatesRepository repository;

    public Coordinates createCoordinates(Coordinates coordinates) {
        return repository.insert(coordinates);
    }

    public List<Coordinates> getAllCoordinates() {
        return repository.findAll().toList();
    }
}
