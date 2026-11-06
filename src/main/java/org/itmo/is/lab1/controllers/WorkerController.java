package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.WorkerDto;
import org.itmo.is.lab1.entities.Worker;
import org.itmo.is.lab1.services.WorkerService;

import java.util.List;

@Path("/worker")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class WorkerController {

    @Inject
    private WorkerService workerService;

    @POST
    public Response createWorker(@Valid WorkerDto dto) {
        Worker created = workerService.createWorker(dto);
        return Response.status(Response.Status.CREATED).entity("создан объект Worker с id=" + created.getId()).build();
    }

    @GET
    public Response getAllWorkers() {
        List<WorkerDto> workerList = workerService.getAllWorkers();
        return Response.ok().build();
    }

    @POST
    @Path("/update")
    public Response updateWorker(WorkerDto dto) {
        boolean successUpdate = workerService.updateWorker(dto);
        if (!successUpdate) {
            return Response.status(Response.Status.CONFLICT).entity("не удалось обновить объект: Worker с id=" + dto.getId() + " не найден в базе").build();
        }
        return Response.ok("обновлен объект с id=" + dto.getId()).build();
    }

    @DELETE
    public Response deleteWorker(Integer id) {
        workerService.deleteWorker(id);
        return Response.ok("удален объект с id=" + id).build();
    }
}
