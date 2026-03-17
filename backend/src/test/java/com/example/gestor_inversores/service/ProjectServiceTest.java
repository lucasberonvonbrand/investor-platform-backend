package com.example.gestor_inversores.service;

import com.example.gestor_inversores.exception.BusinessException;
import com.example.gestor_inversores.exception.UnauthorizedOperationException;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Investor;
import com.example.gestor_inversores.model.Investment;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.ContractStatus;
import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.model.enums.ProjectStatus;
import com.example.gestor_inversores.repository.IContractRepository;
import com.example.gestor_inversores.repository.IInvestmentRepository;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.repository.IStudentRepository;
import com.example.gestor_inversores.service.contract.IContractService;
import com.example.gestor_inversores.service.ia.GeminiService;
import com.example.gestor_inversores.service.mail.IMailService;
import com.example.gestor_inversores.service.project.ProjectService;
import com.example.gestor_inversores.service.projectTag.IProjectTagService;
import com.example.gestor_inversores.service.student.IStudentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @InjectMocks
    private ProjectService projectService;

    @Mock
    private IProjectRepository projectRepository;

    @Mock
    private IStudentService studentService;

    @Mock
    private IProjectTagService projectTagService;

    @Mock
    private GeminiService geminiService;

    @Mock
    private IStudentRepository studentRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IInvestmentRepository investmentRepository;

    @Mock
    private IMailService mailService;

    @Mock
    private IContractService contractService;

    @Test
    void cancelProject_Success_NotifiesInvestors() {
        //Arrange
        Long projectId = 1L;
        Long ownerId = 10L;

        Student owner = new Student();
        owner.setId(ownerId);

        Project project = new Project();
        project.setIdProject(projectId);
        project.setOwner(owner);
        project.setStatus(ProjectStatus.IN_PROGRESS);
        project.setName("Proyecto de Prueba Testing Unitario");

        Investor investor1 = new Investor();
        investor1.setUsername("inversor_uno");
        investor1.setEmail("inversor1@test.com");
        Investor investor2 = new Investor();
        investor2.setUsername("inversor_dos");
        investor2.setEmail("inversor2@test.com");

        Investment investment1 = new Investment();
        investment1.setGeneratedBy(investor1);
        investment1.setCurrency(Currency.USD);
        investment1.setAmount(new BigDecimal("100.00"));

        Investment investment2 = new Investment();
        investment2.setGeneratedBy(investor2);
        investment2.setCurrency(Currency.EUR);
        investment2.setAmount(new BigDecimal("200.00"));

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(investmentRepository.findByProject_IdProject(projectId)).thenReturn(List.of(investment1, investment2));

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        //Act
        projectService.cancelProject(projectId, ownerId);

        //Assert:
        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(projectCaptor.capture());
        Project savedProject = projectCaptor.getValue();

        assertEquals(ProjectStatus.CANCELLED, savedProject.getStatus());
        assertNotNull(savedProject.getEndDate());

        verify(mailService, times(2)).sendEmail(anyString(), anyString(), anyString());
        verify(mailService).sendEmail(eq("inversor1@test.com"), anyString(), anyString());
        verify(mailService).sendEmail(eq("inversor2@test.com"), anyString(), anyString());
    }

    @Test
    void cancelProject_Fails_WhenUserIsNotOwner() {
        //Arrange
        Long projectId = 1L;
        Long ownerId = 10L;
        Long maliciousUserId = 11L;

        Student owner = new Student();
        owner.setId(ownerId);
        Project project = new Project();
        project.setOwner(owner);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        //Act y Assert
        assertThrows(UnauthorizedOperationException.class, () -> {
            projectService.cancelProject(projectId, maliciousUserId);
        });

        verify(projectRepository, never()).save(any());
        verify(mailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void completeProject_Fails_IfContractsAreActive() {

        //Arrange
        Long projectId = 1L;
        Long ownerId = 10L;

        Student owner = new Student();
        owner.setId(ownerId);

        Project project = new Project();
        project.setIdProject(projectId);
        project.setOwner(owner);
        project.setStatus(ProjectStatus.IN_PROGRESS);

        Contract activeContract = new Contract();
        activeContract.setStatus(ContractStatus.SIGNED);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(contractRepository.findByProject_IdProject(projectId)).thenReturn(List.of(activeContract));

        //Act y Assert
        assertThrows(BusinessException.class, () -> {
            projectService.completeProject(projectId, ownerId);
        });

        verify(projectRepository, never()).save(any());
        verify(mailService, never()).sendEmail(anyString(), anyString(), anyString());
    }
}
