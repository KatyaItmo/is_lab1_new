package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.PersonDto;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.entities.Person;
import org.itmo.is.lab1.repositories.LocationRepository;
import org.itmo.is.lab1.repositories.PersonRepository;
import org.itmo.is.lab1.repositories.WorkerRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;
import org.itmo.is.lab1.services.data.EntityType;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.List;

@ApplicationScoped
public class PersonService {

    @Inject
    private PersonRepository personRepository;

    @Inject
    private LocationRepository locationRepository;

    @Inject
    private WorkerRepository workerRepository;

    @Inject
    private WorkerService workerService;

    public Person createPerson(PersonDto dto) {
        Person person = new Person(
                dto.getEyeColor(),
                dto.getHairColor(),
                locationRepository.findById(dto.getLocationId())
                        .orElseThrow(() -> new RuntimeException("error: Location with id=" + dto.getLocationId() + " not found")),
                dto.getBirthday().toZonedDateTime(),
                dto.getHeight(),
                dto.getPassportId(),
                dto.getNationality()
        );

        Person newPerson = personRepository.insert(person);
        if (newPerson != null) {
            UpdateWebSocketEndpoint.broadcast("PERSON");
        }
        return newPerson;
    }

    public List<PersonDto> getAllPersons() {
        return personRepository.findAll()
                .stream()
                .map(person -> new PersonDto(
                        person.getId(),
                        person.getEyeColor(),
                        person.getHairColor(),
                        person.getLocation().getId(),
                        person.getBirthday().toOffsetDateTime(),
                        person.getHeight(),
                        person.getPassportID(),
                        person.getNationality()
                ))
                .toList();
    }

    public Person getPersonById(Integer id) {
        return personRepository.findById(id).orElse(null);
    }

    public DeleteResult deletePerson(Integer id) {
        long workersCount = workerRepository.countByPersonId(id);

        if (workersCount > 0) {
            return DeleteResult.IN_USE;
        }

        boolean deleted = personRepository.deleteById(id);

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("PERSON");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public Person updatePerson(PersonDto dto) {
        Person person = new Person(
                dto.getId(),
                dto.getEyeColor(),
                dto.getHairColor(),
                locationRepository.findById(dto.getLocationId())
                        .orElseThrow(() -> new RuntimeException("error: Location with id=" + dto.getLocationId() + " not found")),
                dto.getBirthday().toZonedDateTime(),
                dto.getHeight(),
                dto.getPassportId(),
                dto.getNationality()
        );

        Person updatedPerson = personRepository.update(person);
        if (updatedPerson != null) {
            UpdateWebSocketEndpoint.broadcast("PERSON");
        }
        return updatedPerson;
    }

    public void updatePersonLocation(Integer personId, Integer newLocationId) {
        if (newLocationId == null) {
            throw new IllegalArgumentException("error: Location can't be null for Person");
        }

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("error: Person with id=" + personId + " not found"));

        Location newLocation = locationRepository.findById(newLocationId)
                .orElseThrow(() -> new RuntimeException("error: Location with id=" + newLocationId + " not found"));

        person.setLocation(newLocation);
        personRepository.update(person);
    }

    public List<DependencyReferenceDto> getDependencies(Integer personId) {
        return workerRepository.findIdsByPersonId(personId)
                .stream()
                .map(workerId -> new DependencyReferenceDto(EntityType.WORKER, workerId))
                .toList();
    }

    public List<PersonDto> getAllPersonsExceptId(Integer excludedId) {
        return personRepository.findAllExceptId(excludedId)
                .stream()
                .map(person -> new PersonDto(
                        person.getId(),
                        person.getEyeColor(),
                        person.getHairColor(),
                        person.getLocation().getId(),
                        person.getBirthday().toOffsetDateTime(),
                        person.getHeight(),
                        person.getPassportID(),
                        person.getNationality()
                ))
                .toList();
    }

    public DeleteResult reassignAndDelete(Integer personId, List<DependencyReferenceDto> updates) {
        if (updates != null) {
            for (DependencyReferenceDto item : updates) {
                if (item.getReplacementId() == null) {
                    throw new IllegalArgumentException("error: replacement Person can't be null for Worker");
                }
                if (item.getReplacementId().equals(personId)) {
                    throw new IllegalArgumentException("error: replacement Person can't be equal to deleted");
                }

                if (item.getEntityType() == EntityType.WORKER) {
                    workerService.updateWorkerPerson(item.getEntityId(), item.getReplacementId());
                }
            }
            UpdateWebSocketEndpoint.broadcast("WORKER");
        }

        return deletePerson(personId);
    }
}
