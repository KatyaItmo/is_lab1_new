package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.AddressDto;
import org.itmo.is.lab1.entities.Address;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.repositories.AddressRepository;
import org.itmo.is.lab1.repositories.LocationRepository;
import org.itmo.is.lab1.repositories.OrganizationRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;
import org.itmo.is.lab1.services.data.EntityType;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AddressService {

    @Inject
    private AddressRepository addressRepository;

    @Inject
    private LocationRepository locationRepository;

    @Inject
    private OrganizationRepository organizationRepository;

    @Inject
    private OrganizationService organizationService;

    public Address createAddress(AddressDto dto) {
        Address address = new Address(
                dto.getStreet(),
                dto.getTownId() != null ? locationRepository.findById(dto.getTownId()).orElse(null) : null
        );

        Address newAddress = addressRepository.insert(address);
        if (newAddress != null) {
            UpdateWebSocketEndpoint.broadcast("ADDRESS");
        }
        return newAddress;
    }

    public List<AddressDto> getAllAddresses() {
        return addressRepository.findAll()
                .stream()
                .map(address -> new AddressDto(
                        address.getId(),
                        address.getStreet(),
                        address.getTown() != null ? address.getTown().getId() : null
                ))
                .toList();
    }

    public DeleteResult deleteAddress(Integer id) {
        long organizationsCount = organizationRepository.countByAddressId(id);

        if (organizationsCount > 0) {
            return DeleteResult.IN_USE;
        }

        boolean deleted = addressRepository.deleteById(id);

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("ADDRESS");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public Address updateAddress(AddressDto dto) {
        Address address = new Address(
                dto.getId(),
                dto.getStreet(),
                dto.getTownId() != null ? locationRepository.findById(dto.getTownId()).orElse(null) : null
        );

        Address updatedAddress = addressRepository.update(address);
        if (updatedAddress != null) {
            UpdateWebSocketEndpoint.broadcast("ADDRESS");
        }
        return updatedAddress;
    }

    public void updateAddressLocation(Integer addressId, Integer newLocationId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("error: address with id=" + addressId + " not found"));

        Location newTown = newLocationId != null
                ? locationRepository.findById(newLocationId)
                  .orElseThrow(() -> new RuntimeException("error: location with id=" + newLocationId + " not found"))
                : null;

        address.setTown(newTown);
    }

    public List<DependencyReferenceDto> getDependencies(Integer addressId) {
        List<DependencyReferenceDto> dependencies = new ArrayList<>();

        organizationRepository.findIdsByOfficialAddressId(addressId)
                .forEach(orgId -> dependencies.add(new DependencyReferenceDto(EntityType.ORGANIZATION_OFFICIAL_ADDRESS, orgId)));

        organizationRepository.findIdsByPostalAddressId(addressId)
                .forEach(orgId -> dependencies.add(new DependencyReferenceDto(EntityType.ORGANIZATION_POSTAL_ADDRESS, orgId)));

        return dependencies;
    }

    public List<AddressDto> getAllAddressesExceptId(Integer excludedId) {
        return addressRepository.findAllExceptId(excludedId)
                .stream()
                .map(address -> new AddressDto(
                        address.getId(),
                        address.getStreet(),
                        address.getTown() != null ? address.getTown().getId() : null
                ))
                .toList();
    }

    public DeleteResult reassignAndDelete(Integer addressId, List<DependencyReferenceDto> updates) {
        if (updates != null) {
            for (DependencyReferenceDto item : updates) {
                if (item.getReplacementId() != null && item.getReplacementId().equals(addressId)) {
                    throw new IllegalArgumentException("error: replacement address cannot be equal to deleted");
                }

                if (item.getEntityType() == EntityType.ORGANIZATION_OFFICIAL_ADDRESS) {
                    organizationService.updateOrganizationOfficialAddress(item.getEntityId(), item.getReplacementId());
                } else if (item.getEntityType() == EntityType.ORGANIZATION_POSTAL_ADDRESS) {
                    if (item.getReplacementId() == null) {
                        throw new IllegalArgumentException("error: replacement address cannot be null for organization postal address");
                    }
                    organizationService.updateOrganizationPostalAddress(item.getEntityId(), item.getReplacementId());
                }
            }
            UpdateWebSocketEndpoint.broadcast("ORGANIZATION");
        }

        return deleteAddress(addressId);
    }

}
