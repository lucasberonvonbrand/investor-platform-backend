package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IProjectTagRepository extends JpaRepository<ProjectTag, Long> {

    ProjectTag findByName(String name);
}
