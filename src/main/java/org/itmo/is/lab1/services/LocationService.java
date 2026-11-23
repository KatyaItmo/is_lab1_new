package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.repositories.AddressRepository;
import org.itmo.is.lab1.repositories.LocationRepository;
import org.itmo.is.lab1.repositories.PersonRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;
import org.itmo.is.lab1.services.data.EntityType;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class LocationService {

    @Inject
    private LocationRepository repository;

    @Inject
    private AddressRepository addressRepository;

    @Inject
    private PersonRepository personRepository;

    @Inject
    private AddressService addressService;

    @Inject
    private PersonService personService;

    public Location createLocation(Location location) {
        Location newLocation = repository.insert(location);
        if (newLocation != null) {
            UpdateWebSocketEndpoint.broadcast("LOCATION");
        }
        return newLocation;
    }

    public List<Location> getAllLocations() {
        return repository.findAll();
    }

    public DeleteResult deleteLocation(Integer id) {
        long addressesCount = addressRepository.countByLocationId(id);
        long personsCount = personRepository.countByLocationId(id);

        if (addressesCount > 0 || personsCount > 0) {
            return DeleteResult.IN_USE;
        }

        boolean deleted = repository.deleteById(id);

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("LOCATION");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public List<DependencyReferenceDto> getDependencies(Integer locationId) {
        List<DependencyReferenceDto> dependencies = new ArrayList<>();

        addressRepository.findIdsByLocationId(locationId)
                .forEach(addressId -> dependencies.add(new DependencyReferenceDto(EntityType.ADDRESS, addressId)));

        personRepository.findIdsByLocationId(locationId)
                .forEach(personId -> dependencies.add(new DependencyReferenceDto(EntityType.PERSON, personId)));

        return dependencies;
    }

    public List<Location> getAllLocationsExceptId(Integer excludedId) {
        return repository.findAllExceptId(excludedId);
    }

    public DeleteResult reassignAndDelete(Integer locationId, List<DependencyReferenceDto> updates) {
        if (updates != null) {
            for (DependencyReferenceDto item : updates) {
                if (item.getReplacementId() != null && item.getReplacementId().equals(locationId)) {
                    throw new IllegalArgumentException("error: replacement Location (town) can't be equal to deleted");
                }

                if (item.getEntityType() == EntityType.ADDRESS) {
                    addressService.updateAddressLocation(item.getEntityId(), item.getReplacementId());
                } else if (item.getEntityType() == EntityType.PERSON) {
                    if (item.getReplacementId() == null) {
                        throw new IllegalArgumentException("error: replacement Location can't be null for Person");
                    }
                    personService.updatePersonLocation(item.getEntityId(), item.getReplacementId());
                }
            }
            UpdateWebSocketEndpoint.broadcast("ADDRESS");
            UpdateWebSocketEndpoint.broadcast("PERSON");
        }

        return deleteLocation(locationId);
    }
}
