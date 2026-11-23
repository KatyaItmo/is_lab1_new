package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.PersonDto;
import org.itmo.is.lab1.entities.Person;
import org.itmo.is.lab1.services.PersonService;
import org.itmo.is.lab1.services.data.DeleteResult;
import org.itmo.is.lab1.services.data.DependencyReferenceDto;

import java.util.List;

@Path("/person")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class PersonController {

    @Inject
    private PersonService personService;

    @POST
    public Response createPerson(@Valid PersonDto dto) {
        Person created = personService.createPerson(dto);
        return Response.status(Response.Status.CREATED).entity("created Person with id=" + created.getId()).build();
    }

    @GET
    public Response getAllPersons() {
        List<PersonDto> personList = personService.getAllPersons();
        return Response.ok(personList).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletePerson(@PathParam("id") Integer id) {
        DeleteResult result = personService.deletePerson(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @PUT
    public Response updatePerson(@Valid PersonDto dto) {
        Person updated = personService.updatePerson(dto);
        return Response.ok("updated Person with id=" + updated.getId()).build();
    }

    @GET
    @Path("/{id}")
    public Response getPersonById(@PathParam("id") Integer id) {
        Person person = personService.getPersonById(id);
        if (person == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Person with id=" + id + " not found").build();
        }
        return Response.ok(person).build();
    }

    @GET
    @Path("/{id}/dependencies")
    public Response getPersonDependencies(@PathParam("id") Integer id) {
        List<DependencyReferenceDto> dependencies = personService.getDependencies(id);
        return Response.ok(dependencies).build();
    }

    @GET
    @Path("/except/{id}")
    public Response getAllPersonsExcept(@PathParam("id") Integer id) {
        List<PersonDto> available = personService.getAllPersonsExceptId(id);
        return Response.ok(available).build();
    }

    @POST
    @Path("/{id}/reassign-delete")
    public Response reassignAndDeletePerson(@PathParam("id") Integer id, List<DependencyReferenceDto> updates) {
        DeleteResult result = personService.reassignAndDelete(id, updates);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

}
