package org.itmo.is.lab1.repositories;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import org.itmo.is.lab1.entities.Person;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PersonRepository {

    @PersistenceUnit(unitName = "myAppPU")
    private EntityManagerFactory entityManagerFactory;

    public Person insert(Person person) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            entityManager.persist(person);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return person;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't create Person", e);
        } finally {
            entityManager.close();
        }
    }

    public Person update(Person person) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Person updatedPerson = entityManager.merge(person);
            entityManager.flush();
            entityManager.getTransaction().commit();
            return updatedPerson;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't update Person", e);
        } finally {
            entityManager.close();
        }
    }

    public List<Person> findAll() {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager.createQuery("SELECT p FROM Person p", Person.class).getResultList();
        }
    }

    public Optional<Person> findById(Integer id) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            Person person = entityManager.find(Person.class, id);
            return Optional.ofNullable(person);
        }
    }

    public boolean deleteById(Integer id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();
            Person person = entityManager.find(Person.class, id);
            if (person == null) {
                entityManager.getTransaction().rollback();
                return false;
            }
            entityManager.remove(person);
            entityManager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (entityManager.getTransaction().isActive()) {
                entityManager.getTransaction().rollback();
            }
            throw new RuntimeException("db error: can't delete Person with id=" + id, e);
        } finally {
            entityManager.close();
        }
    }

    public long countByLocationId(Integer locationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT COUNT(p) FROM Person p WHERE p.location.id = :locationId", Long.class)
                    .setParameter("locationId", locationId)
                    .getSingleResult();
        }
    }

    public List<Integer> findIdsByLocationId(Integer locationId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT p.id FROM Person p WHERE p.location.id = :locationId", Integer.class)
                    .setParameter("locationId", locationId)
                    .getResultList();
        }
    }

    public List<Person> findAllExceptId(Integer excludedId) {
        try (EntityManager entityManager = entityManagerFactory.createEntityManager()) {
            return entityManager
                    .createQuery("SELECT p FROM Person p WHERE p.id <> :excludedId", Person.class)
                    .setParameter("excludedId", excludedId)
                    .getResultList();
        }
    }

}