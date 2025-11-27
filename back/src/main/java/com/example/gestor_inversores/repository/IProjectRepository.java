package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.ProjectTag;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByNameAndDeletedFalse(String name);

    List<Project> findByDeletedFalse();

    Optional<Project> findByIdProjectAndDeletedFalse(Long id);

    List<Project> findByOwner(Student owner);

    List<Project> findByOwnerId(Long ownerId);

    boolean existsByOwnerId(Long ownerId);

    List<Project> findByOwnerIdAndDeletedFalse(Long ownerId);

    List<Project> findByStudents_IdAndDeletedFalse(Long studentId);

    List<Project> findByOwnerIdAndDeletedTrue(Long ownerId);

    List<Project> findByStudents_IdAndDeletedTrue(Long studentId);

    List<Project> findByDeletedTrue();

    List<Project> findByStatusAndStartDateBeforeAndDeletedFalse(ProjectStatus status, LocalDate date);

    List<Project> findByProjectTagAndDeletedFalse(ProjectTag tag);
}
