package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.AddressDto;
import org.itmo.is.lab1.entities.Address;
import org.itmo.is.lab1.services.AddressService;

import java.util.List;

@Path("/address")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AddressController {

    @Inject
    private AddressService addressService;

    @POST
    public Response createAddress(@Valid AddressDto dto) {
        Address created = addressService.createAddress(dto);
        return Response.status(Response.Status.CREATED).entity("создан объект Address с id=" + created.getId()).build();
    }

    @GET
    public Response getAllAddresses() {
        List<AddressDto> addressList = addressService.getAllAddresses();
        return Response.ok(addressList).build();
    }
}
