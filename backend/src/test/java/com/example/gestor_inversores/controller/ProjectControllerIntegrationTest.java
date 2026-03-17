package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestProjectDTO;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.ProjectTag;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.DegreeStatus;
import com.example.gestor_inversores.model.enums.University;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.repository.IProjectTagRepository;
import com.example.gestor_inversores.repository.IStudentRepository;
import com.example.gestor_inversores.service.ia.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IStudentRepository studentRepository;

    @Autowired
    private IProjectRepository projectRepository;

    @Autowired
    private IProjectTagRepository projectTagRepository;

    @MockitoBean
    private GeminiService geminiService;

    @AfterEach
    void tearDown() {
        projectRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        projectTagRepository.deleteAllInBatch();
    }

    @Test
    @WithMockUser(username = "estudiante", roles = {"STUDENT"})
    void testCreateProject_Success() throws Exception {

        //Arrange
        ProjectTag tag = new ProjectTag();
        tag.setName("TECNOLOGÍA");
        projectTagRepository.save(tag);

        Student student = new Student();
        student.setFirstName("Juan");
        student.setLastName("Perez");
        student.setDni("12345678");
        student.setEmail("juan.perez@test.com");
        student.setPhone("1122334455");
        student.setUsername("juanperez");
        student.setPassword("password123");
        student.setCareer("Ingeniería Informática");
        student.setUniversity(University.UBA);
        student.setDegreeStatus(DegreeStatus.IN_PROGRESS);
        student.setDateOfBirth(LocalDate.of(2000, 1, 1));
        student.setEnabled(true);
        student.setAccountNotExpired(true);
        student.setAccountNotLocked(true);
        student.setCredentialNotExpired(true);
        
        student = studentRepository.save(student);

        Mockito.when(geminiService.askGemini(Mockito.anyString())).thenReturn("TECNOLOGÍA");

        RequestProjectDTO requestDTO = new RequestProjectDTO();
        requestDTO.setName("Proyecto IA Test");
        requestDTO.setDescription("Un proyecto innovador de prueba.");
        requestDTO.setBudgetGoal(new BigDecimal("10000.00"));
        requestDTO.setStartDate(LocalDate.now().plusDays(1));
        requestDTO.setEstimatedEndDate(LocalDate.now().plusMonths(6));
        requestDTO.setOwnerId(student.getId());

        //Act
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                
        //Assert
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Proyecto IA Test")))
                .andExpect(jsonPath("$.tagName", is("TECNOLOGÍA")));

        //Assert
        Project projectEnBd = projectRepository.findAll().stream()
                .filter(p -> "Proyecto IA Test".equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No se encontró el proyecto en la BD"));

        assertThat(projectEnBd.getIdProject()).isNotNull();
        assertThat(projectEnBd.getBudgetGoal()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(projectEnBd.getOwner().getId()).isEqualTo(student.getId());
        assertThat(projectEnBd.getProjectTag().getName()).isEqualTo("TECNOLOGÍA");
    }
}
