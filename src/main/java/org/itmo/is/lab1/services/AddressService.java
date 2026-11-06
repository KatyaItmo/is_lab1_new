package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.dtos.AddressDto;
import org.itmo.is.lab1.entities.Address;
import org.itmo.is.lab1.repositories.AddressRepository;
import org.itmo.is.lab1.repositories.LocationRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class AddressService {

    @Inject
    private AddressRepository addressRepository;

    @Inject
    private LocationRepository locationRepository;

    public Address createAddress(AddressDto dto) {
        Address address = new Address(
                dto.getStreet(),
                locationRepository.findById(dto.getLocationId()).orElse(null)
        );

        return addressRepository.insert(address);
    }

    public List<AddressDto> getAllAddresses() {
        return addressRepository.findAll()
                .map(address -> new AddressDto(
                        address.getId(),
                        address.getStreet(),
                        address.getTown().getId()
                ))
                .toList();
    }
}
