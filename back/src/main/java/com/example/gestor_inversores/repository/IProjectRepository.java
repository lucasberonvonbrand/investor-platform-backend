package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IProjectRepository extends JpaRepository<Project, Long> {
    boolean existsByName(String name);
}
