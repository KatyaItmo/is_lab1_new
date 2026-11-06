package org.itmo.is.lab1.controllers;


import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.entities.Coordinates;
import org.itmo.is.lab1.services.CoordinatesService;

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
        return Response.status(Response.Status.CREATED).entity("создан объект Coordinates c id=" + created.getId()).build();
    }

    @GET
    public Response getAllCoordinates() {
        List<Coordinates> coordinatesList = coordinatesService.getAllCoordinates();
        return Response.ok(coordinatesList).build();
    }
}
