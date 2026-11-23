package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.entities.*;

@Path("/enum")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class EnumController {

    @GET
    @Path("/color")
    public Response getColors() {
        return Response.ok(Color.values()).build();
    }

    @GET
    @Path("/country")
    public Response getCountries() {
        return Response.ok(Country.values()).build();
    }

    @GET
    @Path("/organization_type")
    public Response getTypes() {
        return Response.ok(OrganizationType.values()).build();
    }

    @GET
    @Path("/position")
    public Response getPositions() {
        return Response.ok(Position.values()).build();
    }

    @GET
    @Path("/status")
    public Response getStatuses() {
        return Response.ok(Status.values()).build();
    }
}
