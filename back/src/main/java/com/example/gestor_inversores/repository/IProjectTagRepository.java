package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IProjectTagRepository extends JpaRepository<ProjectTag, Long> {

    Optional<ProjectTag> findByName(String name);
}
