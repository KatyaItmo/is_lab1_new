package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.UserDto;
import org.itmo.is.lab1.entities.User;
import org.itmo.is.lab1.repositories.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthService {
    private static final Duration SESSION_TTL = Duration.ofHours(2);
    private final Map<String, SessionInfo> activeSessions = new ConcurrentHashMap<>();

    @Inject
    private UserRepository userRepository;

    private record SessionInfo(Integer userId, String username, Instant expiresAt) {}

    public String register(UserDto dto) {
        String cleanUsername = dto.getUsername().trim();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new IllegalArgumentException("registration error: username '" + cleanUsername + "' is already taken");
        }

        String passwordHash = hashPassword(dto.getPassword());
        User user = new User(null, cleanUsername, passwordHash);
        User created = userRepository.insert(user);

        return createSession(created);
    }

    public String login(UserDto dto) {
        String cleanUsername = dto.getUsername().trim();

        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new IllegalArgumentException("auth error: invalid username"));

        String inputHash = hashPassword(dto.getPassword());
        if (!user.getPasswordHash().equals(inputHash)) {
            throw new IllegalArgumentException("auth error: invalid password");
        }

        return createSession(user);
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            activeSessions.remove(token);
        }
    }

    public boolean isTokenValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        SessionInfo session = activeSessions.get(token);
        if (session == null) {
            return false;
        }

        if (Instant.now().isAfter(session.expiresAt())) {
            activeSessions.remove(token);
            return false;
        }

        return true;
    }

    private String createSession(User user) {
        String token = UUID.randomUUID().toString();
        SessionInfo sessionInfo = new SessionInfo(
                user.getId(),
                user.getUsername(),
                Instant.now().plus(SESSION_TTL)
        );
        activeSessions.put(token, sessionInfo);
        return token;
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("error hashing password", e);
        }
    }
}
