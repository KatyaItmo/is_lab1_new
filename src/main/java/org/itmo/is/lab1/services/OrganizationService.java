package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.itmo.is.lab1.dtos.OrganizationDto;
import org.itmo.is.lab1.entities.Organization;
import org.itmo.is.lab1.repositories.AddressRepository;
import org.itmo.is.lab1.repositories.OrganizationRepository;

import java.util.List;

@ApplicationScoped
@Transactional
public class OrganizationService {

    @Inject
    private OrganizationRepository organizationRepository;

    @Inject
    private AddressRepository addressRepository;

    public Organization createOrganization(OrganizationDto dto) {
        Organization organization = new Organization(
                addressRepository.findById(dto.getOfficialAddressId()).orElse(null),
                dto.getAnnualTurnover(),
                dto.getEmployeesCount(),
                dto.getRating(),
                dto.getType(),
                addressRepository.findById(dto.getPostalAddressId()).orElse(null)
        );

        return organizationRepository.insert(organization);
    }

    public List<OrganizationDto> getAllOrganizations() {
        return organizationRepository.findAll()
                .map(organization -> new OrganizationDto(
                        organization.getId(),
                        organization.getOfficialAddress().getId(),
                        organization.getAnnualTurnover(),
                        organization.getEmployeesCount(),
                        organization.getRating(),
                        organization.getType(),
                        organization.getPostalAddress().getId()
                ))
                .toList();
    }
}
