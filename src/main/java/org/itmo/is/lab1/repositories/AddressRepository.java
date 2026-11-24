package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.Address;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class AddressRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Address insert(Address address) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(address);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return address;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create address", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Address> findAll() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager.createQuery("SELECT a FROM Address a", Address.class).getResultList();
        }
    }

    public Optional<Address> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Address address = entityManager.find(Address.class, id);
            return Optional.ofNullable(address);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Address address = entityManager.find(Address.class, id);
            if (address == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(address);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete address with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public Address update(Address address) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Address updatedAddress = entityManager.merge(address);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return updatedAddress;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't update address", e);
        } finally {
            entityManager.close();
        }
    }


    public long countByLocationId(Integer locationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(a) FROM Address a WHERE a.town.id = :locationId", Long.class)
                    .setParameter("locationId", locationId)
                    .getSingleResult();
        }
    }

    public List<Integer> findIdsByLocationId(Integer locationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT a.id FROM Address a WHERE a.town.id = :locationId", Integer.class)
                    .setParameter("locationId", locationId)
                    .getResultList();
        }
    }

    public List<Address> findAllExceptId(Integer excludedId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT a FROM Address a WHERE a.id <> :excludedId", Address.class)
                    .setParameter("excludedId", excludedId)
                    .getResultList();
        }
    }
}
