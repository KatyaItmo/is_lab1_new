package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.Coordinates;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CoordinatesRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Coordinates insert(Coordinates coordinates) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(coordinates);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return coordinates;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create coordinates", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Coordinates> findAll() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager.createQuery("SELECT c FROM Coordinates c", Coordinates.class).getResultList();
        }
    }

    public Optional<Coordinates> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Coordinates coordinates = entityManager.find(Coordinates.class, id);
            return Optional.ofNullable(coordinates);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Coordinates coordinates = entityManager.find(Coordinates.class, id);
            if (coordinates == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(coordinates);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete coordinates with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public List<Coordinates> findAllExceptId(Integer excludedId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT c FROM Coordinates c WHERE c.id <> :excludedId", Coordinates.class)
                    .setParameter("excludedId", excludedId)
                    .getResultList();
        }
    }

}
