package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.User;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public User insert(User user) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(user);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return user;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create user", e);
        } finally {
            entityManager.close();
        }
    }

    public Optional<User> findByUsername(String username) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            List<User> users = entityManager
                    .createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                    .setParameter("username", username)
                    .getResultList();
            return users.stream().findFirst();
        }
    }

    public boolean existsByUsername(String username) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Long count = entityManager
                    .createQuery("SELECT COUNT(u) FROM User u WHERE u.username = :username", Long.class)
                    .setParameter("username", username)
                    .getSingleResult();
            return count != null && count > 0;
        }
    }
}
