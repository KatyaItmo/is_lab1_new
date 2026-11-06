package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.entities.Location;
import org.itmo.is.lab1.services.LocationService;

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
        return Response.status(Response.Status.CREATED).entity("создан объект Location с id=" + created.getId()).build();
    }

    @GET
    public Response getAllLocations() {
        List<Location> locationList = locationService.getAllLocations();
        return Response.ok(locationList).build();
    }
}
