package org.itmo.is.lab1.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import jakarta.enterprise.context.ApplicationScoped;
import org.itmo.is.lab1.entities.Coordinates;

@Repository
@ApplicationScoped
public interface CoordinatesRepository extends CrudRepository<Coordinates, Integer> {
}
