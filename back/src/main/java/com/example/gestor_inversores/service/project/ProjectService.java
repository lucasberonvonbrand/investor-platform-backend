package com.example.gestor_inversores.service.project;

import com.example.gestor_inversores.dto.RequestProjectDTO;
import com.example.gestor_inversores.dto.RequestProjectUpdateDTO;
import com.example.gestor_inversores.dto.ResponseProjectDTO;
import com.example.gestor_inversores.exception.*;
import com.example.gestor_inversores.mapper.ProjectMapper;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.service.student.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService implements IProjectService {

    private final IProjectRepository projectRepository;
    private final IStudentService studentService;

    @Autowired
    public ProjectService(IProjectRepository projectRepository, IStudentService studentService) {
        this.projectRepository = projectRepository;
        this.studentService = studentService;
    }

    @Transactional
    @Override
    public ResponseProjectDTO save(RequestProjectDTO projectDTO) {
        if(projectRepository.existsByNameAndDeletedFalse(projectDTO.getName())) {
            throw new ExistingProjectException("There is already a project with that name");
        }

        if(projectDTO.getEstimatedEndDate().isBefore(projectDTO.getStartDate())) {
            throw new InvalidProjectException("Estimated end date cannot be before start date");
        }

        Student owner = studentService.findById(projectDTO.getOwnerId())
                .orElseThrow(() -> new StudentNotFoundException("The student was not found"));

        Project project = ProjectMapper.requestProjectToProject(projectDTO);
        project.setCurrentGoal(BigDecimal.ZERO);
        project.getStudents().add(owner);
        project.setCreatedAt(LocalDateTime.now());

        Project savedProject;

        try {
            savedProject = projectRepository.save(project);
        } catch (DataIntegrityViolationException | JpaSystemException ex) {
            throw new CreateException("The project could not be saved");
        }

        return ProjectMapper.projectToResponseProjectDTO(savedProject);
    }

    @Transactional
    @Override
    public ResponseProjectDTO update(Long id, RequestProjectUpdateDTO projectDTO) {
        Project searchedProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));

        if(!projectDTO.getName().equals(searchedProject.getName()) &&
                projectRepository.existsByNameAndDeletedFalse(projectDTO.getName())) {
            throw new ExistingProjectException("There is already a project with that name");
        }

        if(projectDTO.getEstimatedEndDate().isBefore(projectDTO.getStartDate())) {
            throw new InvalidProjectException("Estimated end date cannot be before start date");
        }

        Project updatedProject = ProjectMapper.requestProjectUpdateToProject(projectDTO, searchedProject);
        updatedProject.setModifiedAt(LocalDateTime.now());

        try {
            updatedProject = projectRepository.save(updatedProject);
        } catch (DataIntegrityViolationException | JpaSystemException ex) {
            throw new UpdateException("The project could not be updated");
        }

        return ProjectMapper.projectToResponseProjectDTO(updatedProject);

    }

    @Override
    public void delete(Long id) {
        Project searchedProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));

        searchedProject.setDeleted(true);
        searchedProject.setDeletedAt(LocalDateTime.now());
        projectRepository.save(searchedProject);
    }

    @Override
    public List<ResponseProjectDTO> getAllProjects() {
        return projectRepository.findByDeletedFalse()
                .stream()
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
        Project project = projectRepository.findByIdProjectAndDeletedFalse(id)
                .orElseThrow(() -> new ProjectNotFoundException("The project was not found"));

        return ProjectMapper.projectToResponseProjectDTO(project);
    }
}
