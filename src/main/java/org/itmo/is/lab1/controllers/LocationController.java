package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.LocationService;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;

import java.util.List;

@Path("/location")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class LocationController {

    @Inject
    private LocationService locationService;

    @POST
    public Response createLocation(@Valid Location dto) {
        Location created = locationService.createLocation(dto);
        return Response.status(Response.Status.CREATED).entity("created Location with id=" + created.getId()).build();
    }

    @GET
    public Response getAllLocations() {
        List<Location> locationList = locationService.getAllLocations();
        return Response.ok(locationList).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteLocation(@PathParam("id") Integer id) {
        DeleteResult result = locationService.deleteLocation(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @GET
    @Path("/{id}/dependencies")
    public Response getLocationDependencies(@PathParam("id") Integer id) {
        List<DependencyReferenceDto> dependencies = locationService.getDependencies(id);
        return Response.ok(dependencies).build();
    }

    @GET
    @Path("/except/{id}")
    public Response getAllLocationsExcept(@PathParam("id") Integer id) {
        List<Location> available = locationService.getAllLocationsExceptId(id);
        return Response.ok(available).build();
    }

    @POST
    @Path("/{id}/reassign-delete")
    public Response reassignAndDeleteLocation(@PathParam("id") Integer id, List<DependencyReferenceDto> updates) {
        DeleteResult result = locationService.reassignAndDelete(id, updates);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

}
