package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import jakarta.persistence.TypedQuery;
import org.itmo.is.lab1.entities.Status;
import org.itmo.is.lab1.entities.Worker;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class WorkerRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Worker insert(Worker worker) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(worker);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return worker;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create Worker", e);
        } finally {
            entityManager.close();
        }
    }

    public Worker update(Worker worker) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Worker updatedWorker = entityManager.merge(worker);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return updatedWorker;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't update Worker", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Worker> findAll(String nameFilter, boolean ascending, int skip, int limit) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            String direction = ascending ? "ASC" : "DESC";
            StringBuilder jpql = new StringBuilder("SELECT w FROM Worker w");

            boolean hasFilter = nameFilter != null && !nameFilter.isBlank();
            if (hasFilter) {
                jpql.append(" WHERE w.name = :nameFilter");
            }

            jpql.append(" ORDER BY w.name ").append(direction);

            TypedQuery<Worker> query = entityManager.createQuery(jpql.toString(), Worker.class);

            if (hasFilter) {
                query.setParameter("nameFilter", nameFilter.trim());
            }
            query.setFirstResult(skip);
            query.setMaxResults(limit);

            return query.getResultList();
        }
    }

    public long countAll(String nameFilter) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            StringBuilder jpql = new StringBuilder("SELECT COUNT(w) FROM Worker w");

            boolean hasFilter = nameFilter != null && !nameFilter.isBlank();
            if (hasFilter) {
                jpql.append(" WHERE w.name = :nameFilter");
            }

            TypedQuery<Long> query = entityManager.createQuery(jpql.toString(), Long.class);

            if (hasFilter) {
                query.setParameter("nameFilter", nameFilter.trim());
            }

            return query.getSingleResult();
        }
    }


    public Optional<Worker> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Worker worker = entityManager.find(Worker.class, id);
            return Optional.ofNullable(worker);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Worker worker = entityManager.find(Worker.class, id);
            if (worker == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(worker);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete Worker with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public double getAverageRating() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            String jpql = "SELECT AVG(w.rating) FROM Worker w";
            TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
            Double result = query.getSingleResult();
            return result != null ? result : 0.0;
        }
    }

    public long countByStatusLessThan(Status status) {
        List<Status> lessStatuses = Arrays.stream(Status.values())
                .filter(s -> s.ordinal() < status.ordinal())
                .toList();

        if (lessStatuses.isEmpty()) {
            return 0L;
        }

        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(w) FROM Worker w WHERE w.status IN :statuses", Long.class)
                    .setParameter("statuses", lessStatuses)
                    .getSingleResult();
        }
    }

    public List<Status> findDistinctStatuses() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT DISTINCT w.status FROM Worker w", Status.class)
                    .getResultList();
        }
    }

    public long countByCoordinatesId(Integer coordinatesId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(w) FROM Worker w WHERE w.coordinates.id = :coordinatesId", Long.class)
                    .setParameter("coordinatesId", coordinatesId)
                    .getSingleResult();
        }
    }

    public long countByOrganizationId(Integer organizationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(w) FROM Worker w WHERE w.organization.id = :organizationId", Long.class)
                    .setParameter("organizationId", organizationId)
                    .getSingleResult();
        }
    }

    public long countByPersonId(Integer personId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(w) FROM Worker w WHERE w.person.id = :personId", Long.class)
                    .setParameter("personId", personId)
                    .getSingleResult();
        }
    }

    public List<Integer> findIdsByCoordinatesId(Integer coordinatesId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT w.id FROM Worker w WHERE w.coordinates.id = :coordinatesId", Integer.class)
                    .setParameter("coordinatesId", coordinatesId)
                    .getResultList();
        }
    }

    public List<Integer> findIdsByOrganizationId(Integer organizationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT w.id FROM Worker w WHERE w.organization.id = :organizationId", Integer.class)
                    .setParameter("organizationId", organizationId)
                    .getResultList();
        }
    }

    public List<Integer> findIdsByPersonId(Integer personId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT w.id FROM Worker w WHERE w.person.id = :personId", Integer.class)
                    .setParameter("personId", personId)
                    .getResultList();
        }
    }
}
