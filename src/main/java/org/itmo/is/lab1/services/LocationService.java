package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.repositories.LocationRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class LocationService {

    @Inject
    private LocationRepository repository;

    public Location createLocation(Location location) {
        return repository.insert(location);
    }

    public List<Location> getAllLocations() {
        return repository.findAll().toList();
    }
}
