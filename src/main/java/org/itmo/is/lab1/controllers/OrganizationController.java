package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.OrganizationDto;
import org.itmo.is.lab1.entities.Organization;
import org.itmo.is.lab1.entities.Worker;
import org.itmo.is.lab1.services.OrganizationService;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;

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
        return Response.status(Response.Status.CREATED).entity("created Organization with id=" + created.getId()).build();
    }

    @GET
    public Response getAllOrganizations() {
        List<OrganizationDto> organizationList = organizationService.getAllOrganizations();
        return Response.ok(organizationList).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteOrganization(@PathParam("id") Integer id) {
        DeleteResult result = organizationService.deleteOrganization(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @PUT
    public Response updateOrganization(@Valid OrganizationDto dto) {
        Organization updated = organizationService.updateOrganization(dto);
        return Response.ok("updated Organization with id=" + updated.getId()).build();
    }

    @GET
    @Path("/average-rating")
    public Response getAverageRating() {
        double averageRating = organizationService.getAverageRating();
        return Response.ok(averageRating).build();
    }

    @GET
    @Path("/{id}")
    public Response getOrganizationById(@PathParam("id") Integer id) {
        Organization organization = organizationService.getOrganizationById(id);
        if (organization == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Organization with id=" + id + "not found").build();
        }
        return Response.ok(organization).build();
    }

    @GET
    @Path("/{id}/dependencies")
    public Response getOrganizationDependencies(@PathParam("id") Integer id) {
        List<DependencyReferenceDto> dependencies = organizationService.getDependencies(id);
        return Response.ok(dependencies).build();
    }

    @GET
    @Path("/except/{id}")
    public Response getAllOrganizationsExcept(@PathParam("id") Integer id) {
        List<OrganizationDto> available = organizationService.getAllOrganizationsExceptId(id);
        return Response.ok(available).build();
    }

    @POST
    @Path("/{id}/reassign-delete")
    public Response reassignAndDeleteOrganization(@PathParam("id") Integer id, List<DependencyReferenceDto> updates) {
        DeleteResult result = organizationService.reassignAndDelete(id, updates);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

}
