package org.itmo.is.lab1.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.itmo.is.lab1.dtos.UserDto;
import org.itmo.is.lab1.entities.User;
import org.itmo.is.lab1.repositories.UserRepository;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthService {
    private static final Duration SESSION_TTL = Duration.ofHours(2);
    private static final String PEPPER = System.getenv().getOrDefault("APP_PEPPER", "itmo-is-lab1-pepper");
    private static final int SALT_LENGTH = 16;
    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;

    private final Map<String, SessionInfo> activeSessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Inject
    private UserRepository userRepository;

    private record SessionInfo(Integer userId, String username, Instant expiresAt) {}

    public String register(UserDto dto) {
        String cleanUsername = dto.getUsername().trim();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new IllegalArgumentException("registration error: username @" + cleanUsername + " is already taken");
        }

        String passwordHash = hashPassword(dto.getPassword());
        User user = new User(null, cleanUsername, passwordHash);
        User created = userRepository.insert(user);

        return createSession(created);
    }

    public String login(UserDto dto) {
        String cleanUsername = dto.getUsername().trim();

        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new IllegalArgumentException("username @" + cleanUsername + " not registered yet"));

        if (!verifyPassword(dto.getPassword(), user.getPasswordHash())) {
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
            byte[] salt = new byte[SALT_LENGTH];
            secureRandom.nextBytes(salt);
            byte[] hash = computePbkdf2(rawPassword, salt);
            return HexFormat.of().formatHex(salt) + ":" + HexFormat.of().formatHex(hash);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("error hashing password", e);
        }
    }

    private boolean verifyPassword(String rawPassword, String storedValue) {
        if (storedValue == null || !storedValue.contains(":")) {
            return false;
        }
        try {
            String[] parts = storedValue.split(":", 2);
            byte[] salt = HexFormat.of().parseHex(parts[0]);
            byte[] expectedHash = HexFormat.of().parseHex(parts[1]);
            byte[] actualHash = computePbkdf2(rawPassword, salt);
            return MessageDigest.isEqual(expectedHash, actualHash);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] computePbkdf2(String rawPassword, byte[] salt) throws GeneralSecurityException {
        char[] passwordWithPepper = (rawPassword + PEPPER).toCharArray();
        PBEKeySpec spec = new PBEKeySpec(passwordWithPepper, salt, ITERATIONS, KEY_LENGTH);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        return factory.generateSecret(spec).getEncoded();
    }
}
