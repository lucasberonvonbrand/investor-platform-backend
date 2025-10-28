package com.example.gestor_inversores.service.scheduler;

import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.enums.ProjectStatus;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.service.project.IProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProjectFundingScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ProjectFundingScheduler.class);

    private final IProjectRepository projectRepository;
    private final IProjectService projectService;

    public ProjectFundingScheduler(IProjectRepository projectRepository, IProjectService projectService) {
        this.projectRepository = projectRepository;
        this.projectService = projectService;
    }

    @Scheduled(cron = "0 0 1 * * ?") // Se ejecuta todos los días a la 1:00 AM
    public void checkUnfundedProjects() {
        logger.info("Iniciando tarea programada: Verificación de proyectos no financiados...");

        LocalDate today = LocalDate.now();
        List<Project> unfundedProjects = projectRepository.findByStatusAndStartDateBeforeAndDeletedFalse(
                ProjectStatus.PENDING_FUNDING,
                today
        );

        if (unfundedProjects.isEmpty()) {
            logger.info("No se encontraron proyectos no financiados para procesar.");
            return;
        }

        logger.info("Se encontraron {} proyectos para marcar como no financiados.", unfundedProjects.size());

        for (Project project : unfundedProjects) {
            try {
                logger.info("Procesando proyecto ID: {}. Nombre: {}", project.getIdProject(), project.getName());
                projectService.failFundingProject(project.getIdProject(), project.getOwner().getId());
                logger.info("Proyecto ID: {} marcado como NOT_FUNDED exitosamente.", project.getIdProject());
            } catch (Exception e) {
                logger.error("Error al procesar el proyecto ID: " + project.getIdProject(), e);
            }
        }

        logger.info("Tarea programada finalizada.");
    }
}
