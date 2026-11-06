package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.OrganizationDto;
import org.itmo.is.lab1.entities.Organization;
import org.itmo.is.lab1.services.OrganizationService;

import java.util.List;

@Path("/organization")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class OrganizationController {

    @Inject
    private OrganizationService organizationService;

    @POST
    public Response createOrganization(@Valid OrganizationDto dto) {
        Organization created = organizationService.createOrganization(dto);
        return Response.status(Response.Status.CREATED).entity("создан объект Organization с id=" + created.getId()).build();
    }

    @GET
    public Response getAllOrganizations() {
        List<OrganizationDto> organizationList = organizationService.getAllOrganizations();
        return Response.ok(organizationList).build();
    }
}
