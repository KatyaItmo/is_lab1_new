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
        return Response.status(Response.Status.CREATED).entity("создан объект Person с id=" + created.getId()).build();
    }

    @GET
    public Response getAllPersons() {
        List<PersonDto> personList = personService.getAllPersons();
        return Response.ok(personList).build();
    }
}
