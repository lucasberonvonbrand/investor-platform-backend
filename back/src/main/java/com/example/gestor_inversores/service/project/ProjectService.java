package com.example.gestor_inversores.service.project;

import com.example.gestor_inversores.dto.RequestProjectDTO;
import com.example.gestor_inversores.dto.RequestProjectUpdateDTO;
import com.example.gestor_inversores.dto.ResponseProjectDTO;
import com.example.gestor_inversores.exception.CreateException;
import com.example.gestor_inversores.exception.ExistingProjectException;
import com.example.gestor_inversores.exception.ProjectNotFoundException;
import com.example.gestor_inversores.exception.UpdateException;
import com.example.gestor_inversores.mapper.ProjectMapper;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.repository.IProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService implements IProjectService {

    private final IProjectRepository projectRepository;

    @Autowired
    public ProjectService(IProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    @Override
    public ResponseProjectDTO save(RequestProjectDTO projectDTO) {
        if(projectRepository.existsByName(projectDTO.getName())) {
            throw new ExistingProjectException("There is already a project with that name");
        }

        Project project = ProjectMapper.requestProjectToProject(projectDTO);
        project.setCurrentGoal(new BigDecimal("0.0"));

        Project savedProject = projectRepository.save(project);

        return Optional.of(savedProject)
                .map(ProjectMapper::projectToResponseProjectDTO)
                .orElseThrow(() -> new CreateException("The project could not be saved"));
    }

    @Transactional
    @Override
    public ResponseProjectDTO update(Long id, RequestProjectUpdateDTO projectDTO) {
        Project searchedProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));

        Project projectWithUpdates = ProjectMapper.requestProjectUpdateToProject(projectDTO, searchedProject);

        Project projectUpdated = projectRepository.save(projectWithUpdates);

        return Optional.of(projectUpdated)
                .map(ProjectMapper::projectToResponseProjectDTO)
                .orElseThrow(() -> new UpdateException("The project could not be updated"));

    }

    @Override
    public void delete(Long id) {
        Project searchedProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));
        projectRepository.delete(searchedProject);
    }

    @Override
    public List<ResponseProjectDTO> getAllProjects() {
        List<Project> list = projectRepository.findAll();

        return list.stream()
                .map(ProjectMapper::projectToResponseProjectDTO)
                .toList();
    }

    @Override
    public List<ResponseProjectDTO> getAllProjectsByStudent() {
        return List.of();
    }

    @Override
    public List<ResponseProjectDTO> getAllProjectsByInvestor() {
        return List.of();
    }

    @Override
    public ResponseProjectDTO findById(Long id) {
        Project searchedProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));

        return ProjectMapper.projectToResponseProjectDTO(searchedProject);
    }
}
