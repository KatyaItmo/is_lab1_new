package org.itmo.is.lab1.controllers;


import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.entities.Coordinates;
import org.itmo.is.lab1.services.CoordinatesService;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;

import java.util.List;

@Path("/coordinates")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class CoordinatesController {

    @Inject
    private CoordinatesService coordinatesService;

    @POST
    public Response createCoordinates(@Valid Coordinates dto) {
        Coordinates created = coordinatesService.createCoordinates(dto);
        return Response.status(Response.Status.CREATED).entity("created Coordinates with id=" + created.getId()).build();
    }

    @GET
    public Response getAllCoordinates() {
        List<Coordinates> coordinatesList = coordinatesService.getAllCoordinates();
        return Response.ok(coordinatesList).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteCoordinates(@PathParam("id") Integer id) {
        DeleteResult result = coordinatesService.deleteCoordinates(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @GET
    @Path("/{id}/dependencies")
    public Response getCoordinatesDependencies(@PathParam("id") Integer id) {
        List<DependencyReferenceDto> dependencies = coordinatesService.getDependencies(id);
        return Response.ok(dependencies).build();
    }

    @GET
    @Path("/except/{id}")
    public Response getAllCoordinatesExcept(@PathParam("id") Integer id) {
        List<Coordinates> available = coordinatesService.getAllCoordinatesExceptId(id);
        return Response.ok(available).build();
    }

    @POST
    @Path("/{id}/reassign-delete")
    public Response reassignAndDeleteCoordinates(@PathParam("id") Integer id, List<DependencyReferenceDto> updates) {
        DeleteResult result = coordinatesService.reassignAndDelete(id, updates);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

}
