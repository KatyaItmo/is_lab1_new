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
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;

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
        return Response.status(Response.Status.CREATED).entity("created Address with id=" + created.getId()).build();
    }

    @GET
    public Response getAllAddresses() {
        List<AddressDto> addressList = addressService.getAllAddresses();
        return Response.ok(addressList).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteAddress(@PathParam("id") Integer id) {
        DeleteResult result = addressService.deleteAddress(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @PUT
    public Response updateAddress(@Valid AddressDto dto) {
        Address updated = addressService.updateAddress(dto);
        return Response.ok("updated Address with id=" + updated.getId()).build();
    }

    @GET
    @Path("/{id}/dependencies")
    public Response getAddressDependencies(@PathParam("id") Integer id) {
        List<DependencyReferenceDto> dependencies = addressService.getDependencies(id);
        return Response.ok(dependencies).build();
    }

    @GET
    @Path("/except/{id}")
    public Response getAllAddressesExcept(@PathParam("id") Integer id) {
        List<AddressDto> available = addressService.getAllAddressesExceptId(id);
        return Response.ok(available).build();
    }

    @POST
    @Path("/{id}/reassign-delete")
    public Response reassignAndDeleteAddress(@PathParam("id") Integer id, List<DependencyReferenceDto> updates) {
        DeleteResult result = addressService.reassignAndDelete(id, updates);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

}
