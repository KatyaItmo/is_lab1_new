package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.WorkerDto;
import org.itmo.is.lab1.entities.Status;
import org.itmo.is.lab1.entities.Worker;
import org.itmo.is.lab1.services.WorkerService;
import org.itmo.is.lab1.services.data.DeleteResult;

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
        return Response.status(Response.Status.CREATED).entity("created worker with id=" + created.getId()).build();
    }

    @GET
    @Path("/{id}")
    public Response getWorkerById(@PathParam("id") Integer id) {
        Worker worker = workerService.getWorkerById(id);
        if (worker == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("worker with id=" + id + " not found").build();
        }
        return Response.ok(worker).build();
    }

    @PUT
    public Response updateWorker(@Valid WorkerDto dto) {
        Worker updated = workerService.updateWorker(dto);
        return Response.ok("updated worker with id=" + updated.getId()).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteWorker(@PathParam("id") Integer id) {
        DeleteResult result = workerService.deleteWorker(id);

        return switch (result) {
            case DELETED -> Response.ok().build();
            case NOT_FOUND -> Response.status(Response.Status.NOT_FOUND).build();
            case IN_USE -> Response.status(Response.Status.CONFLICT).build();
        };
    }

    @GET
    public Response getWorkers(
            @QueryParam("filteredValue") String filteredValue,
            @QueryParam("sortOrder") String sortOrder,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size
    ) {
        List<WorkerDto> workerList = workerService.getWorkers(filteredValue, sortOrder, page, size);
        long totalCount = workerService.countFilteredWorkers(filteredValue);

        return Response.ok(workerList)
                .header("total-count", totalCount)
                .build();
    }

    @GET
    @Path("/average-rating")
    public Response getAverageRating() {
        double averageRating = workerService.getAverageRating();
        return Response.ok(averageRating).build();
    }

    @GET
    @Path("/count-status-less-than")
    public Response countByStatusLessThan(@QueryParam("status") Status status) {
        if (status == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("parameter status is required").build();
        }
        long count = workerService.countByStatusLessThan(status);
        return Response.ok(count).build();
    }

    @GET
    @Path("/statuses")
    public Response getDistinctStatuses() {
        List<Status> statuses = workerService.getDistinctStatuses();
        return Response.ok(statuses).build();
    }

    @PUT
    @Path("/{id}/fire")
    public Response fireWorker(@PathParam("id") Integer id) {
        Worker fired = workerService.fireWorker(id);
        return Response.ok("fired worker with id=" + fired.getId()).build();
    }

    @PUT
    @Path("/{id}/salary")
    public Response indexSalary(
            @PathParam("id") Integer id,
            @QueryParam("coefficient") Integer coefficient
    ) {
        if (coefficient == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("parameter coefficient is required").build();
        }
        Worker updated = workerService.indexSalary(id, coefficient);
        return Response.ok("indexed salary for worker with id=" + updated.getId()).build();
    }
}