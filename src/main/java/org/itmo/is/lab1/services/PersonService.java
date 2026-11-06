package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.dtos.PersonDto;
import org.itmo.is.lab1.entities.Person;
import org.itmo.is.lab1.repositories.LocationRepository;
import org.itmo.is.lab1.repositories.PersonRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class PersonService {

    @Inject
    private PersonRepository personRepository;

    @Inject
    private LocationRepository locationRepository;

    public Person createPerson(PersonDto dto) {
        Person person = new Person(
                dto.getEyeColor(),
                dto.getHairColor(),
                locationRepository.findById(dto.getLocationId()).orElse(null),
                dto.getBirthday().toZonedDateTime(),
                dto.getHeight(),
                dto.getPassportId(),
                dto.getNationality()
        );

        return personRepository.insert(person);
    }

    public List<PersonDto> getAllPersons() {
        return personRepository.findAll()
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
}
