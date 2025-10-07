package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IProjectRepository extends JpaRepository<Project, Long> {
    boolean existsByNameAndDeletedFalse(String name);
    List<Project> findByDeletedFalse();
    Optional<Project> findByIdProjectAndDeletedFalse(Long id);

    // Buscar proyectos por owner
    List<Project> findByOwner(Student owner);

    // Alternativamente, si querés pasar solo el id del owner
    List<Project> findByOwnerId(Long ownerId);

    boolean existsByOwnerId(Long ownerId);

}
