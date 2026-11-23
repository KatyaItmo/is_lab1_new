package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.Organization;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class OrganizationRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Organization insert(Organization organization) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(organization);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return organization;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create Organization", e);
        } finally {
            entityManager.close();
        }
    }

    public Organization update(Organization organization) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Organization updatedOrganization = entityManager.merge(organization);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return updatedOrganization;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't update Organization", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Organization> findAll() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager.createQuery("SELECT o FROM Organization o", Organization.class).getResultList();
        }
    }

    public Optional<Organization> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Organization organization = entityManager.find(Organization.class, id);
            return Optional.ofNullable(organization);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Organization organization = entityManager.find(Organization.class, id);
            if (organization == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(organization);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete Organization with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public double getAverageRating() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Double result = entityManager
                    .createQuery("SELECT AVG(o.rating) FROM Organization o", Double.class)
                    .getSingleResult();
            return result != null ? result : 0.0;
        }
    }

    public long countByAddressId(Integer addressId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery(
                            "SELECT COUNT(o) FROM Organization o " +
                                    "WHERE o.officialAddress.id = :addressId OR o.postalAddress.id = :addressId",
                            Long.class
                    )
                    .setParameter("addressId", addressId)
                    .getSingleResult();
        }
    }

    public List<Integer> findIdsByOfficialAddressId(Integer addressId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT o.id FROM Organization o WHERE o.officialAddress.id = :addressId", Integer.class)
                    .setParameter("addressId", addressId)
                    .getResultList();
        }
    }

    public List<Integer> findIdsByPostalAddressId(Integer addressId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT o.id FROM Organization o WHERE o.postalAddress.id = :addressId", Integer.class)
                    .setParameter("addressId", addressId)
                    .getResultList();
        }
    }

    public List<Organization> findAllExceptId(Integer excludedId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT o FROM Organization o WHERE o.id <> :excludedId", Organization.class)
                    .setParameter("excludedId", excludedId)
                    .getResultList();
        }
    }

}