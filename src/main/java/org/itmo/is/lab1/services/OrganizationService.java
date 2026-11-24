package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.OrganizationDto;
import org.itmo.is.lab1.entities.Address;
import org.itmo.is.lab1.entities.Organization;
import org.itmo.is.lab1.repositories.AddressRepository;
import org.itmo.is.lab1.repositories.OrganizationRepository;
import org.itmo.is.lab1.repositories.WorkerRepository;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;
import org.itmo.is.lab1.services.data.EntityType;
import org.itmo.is.lab1.websockets.UpdateWebSocketEndpoint;

import java.util.List;

@ApplicationScoped
public class OrganizationService {

    @Inject
    private OrganizationRepository organizationRepository;

    @Inject
    private AddressRepository addressRepository;

    @Inject
    private WorkerRepository workerRepository;

    @Inject
    private WorkerService workerService;

    public Organization createOrganization(OrganizationDto dto) {
        Organization organization = new Organization(
                dto.getOfficialAddressId() != null ? addressRepository.findById(dto.getOfficialAddressId()).orElse(null) : null,
                dto.getAnnualTurnover(),
                dto.getEmployeesCount(),
                dto.getRating(),
                dto.getType(),
                addressRepository.findById(dto.getPostalAddressId())
                        .orElseThrow(() -> new RuntimeException("error: address with id=" + dto.getPostalAddressId() + " not found"))
        );

        Organization newOrganization = organizationRepository.insert(organization);
        if (newOrganization != null) {
            UpdateWebSocketEndpoint.broadcast("ORGANIZATION");
        }
        return newOrganization;
    }

    public List<OrganizationDto> getAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(organization -> new OrganizationDto(
                        organization.getId(),
                        organization.getOfficialAddress() != null ? organization.getOfficialAddress().getId() : null,
                        organization.getAnnualTurnover(),
                        organization.getEmployeesCount(),
                        organization.getRating(),
                        organization.getType(),
                        organization.getPostalAddress().getId()
                ))
                .toList();
    }

    public Organization getOrganizationById(Integer id) {
        return organizationRepository.findById(id).orElse(null);
    }

    public DeleteResult deleteOrganization(Integer id) {
        long workersCount = workerRepository.countByOrganizationId(id);

        if (workersCount > 0) {
            return DeleteResult.IN_USE;
        }

        boolean deleted = organizationRepository.deleteById(id);

        if (deleted) {
            UpdateWebSocketEndpoint.broadcast("ORGANIZATION");
        }

        return deleted ? DeleteResult.DELETED : DeleteResult.NOT_FOUND;
    }

    public Organization updateOrganization(OrganizationDto dto) {
        Organization organization = new Organization(
                dto.getId(),
                dto.getOfficialAddressId() != null ? addressRepository.findById(dto.getOfficialAddressId()).orElse(null) : null,
                dto.getAnnualTurnover(),
                dto.getEmployeesCount(),
                dto.getRating(),
                dto.getType(),
                addressRepository.findById(dto.getPostalAddressId())
                        .orElseThrow(() -> new RuntimeException("error: address with id=" + dto.getPostalAddressId() + " not found"))
        );

        Organization updatedOrganization = organizationRepository.update(organization);
        if (updatedOrganization != null) {
            UpdateWebSocketEndpoint.broadcast("ORGANIZATION");
        }
        return updatedOrganization;
    }

    public double getAverageRating() {
        return organizationRepository.getAverageRating();
    }

    public void updateOrganizationOfficialAddress(Integer organizationId, Integer newAddressId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("error: organization with id=" + organizationId + " not found"));

        Address newAddress = newAddressId != null
                ? addressRepository.findById(newAddressId)
                  .orElseThrow(() -> new RuntimeException("error: address with id=" + newAddressId + " not found"))
                : null;

        organization.setOfficialAddress(newAddress);
        organizationRepository.update(organization);
    }

    public void updateOrganizationPostalAddress(Integer organizationId, Integer newAddressId) {
        if (newAddressId == null) {
            throw new IllegalArgumentException("error: postal address cannot be null for organization");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("error: organization with id=" + organizationId + " not found"));

        Address newAddress = addressRepository.findById(newAddressId)
                .orElseThrow(() -> new RuntimeException("error: address with id=" + newAddressId + " not found"));

        organization.setPostalAddress(newAddress);
        organizationRepository.update(organization);
    }

    public List<DependencyReferenceDto> getDependencies(Integer organizationId) {
        return workerRepository.findIdsByOrganizationId(organizationId)
                .stream()
                .map(workerId -> new DependencyReferenceDto(EntityType.WORKER, workerId))
                .toList();
    }

    public List<OrganizationDto> getAllOrganizationsExceptId(Integer excludedId) {
        return organizationRepository.findAllExceptId(excludedId)
                .stream()
                .map(organization -> new OrganizationDto(
                        organization.getId(),
                        organization.getOfficialAddress() != null ? organization.getOfficialAddress().getId() : null,
                        organization.getAnnualTurnover(),
                        organization.getEmployeesCount(),
                        organization.getRating(),
                        organization.getType(),
                        organization.getPostalAddress().getId()
                ))
                .toList();
    }

    public DeleteResult reassignAndDelete(Integer organizationId, List<DependencyReferenceDto> updates) {
        if (updates != null) {
            for (DependencyReferenceDto item : updates) {
                if (item.getReplacementId() != null && item.getReplacementId().equals(organizationId)) {
                    throw new IllegalArgumentException("error: replacement organization cannot be equal to deleted");
                }

                if (item.getEntityType() == EntityType.WORKER) {
                    workerService.updateWorkerOrganization(item.getEntityId(), item.getReplacementId());
                }
            }
            UpdateWebSocketEndpoint.broadcast("WORKER");
        }

        return deleteOrganization(organizationId);
    }

}
