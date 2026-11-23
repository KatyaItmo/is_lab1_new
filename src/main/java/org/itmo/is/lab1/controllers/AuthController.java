package org.itmo.is.lab1.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.itmo.is.lab1.dtos.UserDto;
import org.itmo.is.lab1.services.AuthService;

import java.util.Map;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AuthController {

    @Inject
    private AuthService authService;

    @POST
    @Path("/register")
    public Response register(@Valid UserDto dto) {
        String token = authService.register(dto);
        return Response.status(Response.Status.CREATED)
                .entity(Map.of(
                        "token", token,
                        "username", dto.getUsername().trim()
                ))
                .build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid UserDto dto) {
        String token = authService.login(dto);
        return Response.ok(Map.of(
                        "token", token,
                        "username", dto.getUsername().trim()
                ))
                .build();
    }

    @POST
    @Path("/logout")
    public Response logout(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = extractBearerToken(authHeader);
        authService.logout(token);
        return Response.ok(Map.of("message", "logged out successfully")).build();
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }
}
