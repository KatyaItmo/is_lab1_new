package org.itmo.is.lab1.exceptions;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;

@Provider
public class RuntimeExceptionMapper implements ExceptionMapper<RuntimeException> {

    @Override
    public Response toResponse(RuntimeException exception) {
        String msg = exception.getMessage() != null ? exception.getMessage() : "internal server error";
        Response.Status status = msg.toLowerCase().contains("not found")
                ? Response.Status.NOT_FOUND
                : Response.Status.BAD_REQUEST;

        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("message", msg))
                .build();
    }
}
