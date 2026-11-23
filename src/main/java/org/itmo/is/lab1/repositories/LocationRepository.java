package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.Location;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class LocationRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Location insert(Location location) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(location);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return location;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create Location", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Location> findAll() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager.createQuery("SELECT l FROM Location l", Location.class).getResultList();
        }
    }

    public Optional<Location> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Location location = entityManager.find(Location.class, id);
            return Optional.ofNullable(location);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Location location = entityManager.find(Location.class, id);
            if (location == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(location);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete Location with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public List<Location> findAllExceptId(Integer excludedId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT l FROM Location l WHERE l.id <> :excludedId", Location.class)
                    .setParameter("excludedId", excludedId)
                    .getResultList();
        }
    }
}