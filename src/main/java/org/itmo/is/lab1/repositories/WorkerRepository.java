package org.itmo.is.lab1.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import jakarta.enterprise.context.ApplicationScoped;
import org.itmo.is.lab1.entities.Worker;

@Repository
@ApplicationScoped
public interface WorkerRepository extends CrudRepository<Worker, Integer> {
}
