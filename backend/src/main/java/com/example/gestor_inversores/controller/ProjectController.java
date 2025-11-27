package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.service.project.IProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final IProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseProjectDTO> create(@Valid @RequestBody RequestProjectDTO projectDTO) {
        ResponseProjectDTO responseProjectDTO = projectService.save(projectDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseProjectDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ResponseProjectDTO> update(@Valid @RequestBody RequestProjectUpdateDTO projectUpdateDTO, @PathVariable Long id) {
        ResponseProjectDTO responseProjectDTO = projectService.update(id, projectUpdateDTO);
        return ResponseEntity.status(HttpStatus.OK).body(responseProjectDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<ResponseProjectDTO> getById(@PathVariable Long id) {
        ResponseProjectDTO responseProjectDTO = projectService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(responseProjectDTO);
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<List<ResponseProjectStudentDTO>> getStudentsByProject(@PathVariable Long id) {
        List<ResponseProjectStudentDTO> listResponseStudentDTO =
                projectService.getStudentsByProject(id);
        return ResponseEntity.status(HttpStatus.OK).body(listResponseStudentDTO);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public List<ResponseProjectDTO> getAllProjects(@RequestParam(defaultValue = "true") boolean active) {
        return projectService.getAllProjects(active);
    }

    @GetMapping("/dashboard-admin/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResponseProjectDTO>> getAllProjectsAdmin() {
        List<ResponseProjectDTO> projects = projectService.getAllProjectsAdmin();
        return ResponseEntity.status(HttpStatus.OK).body(projects);
    }

    @GetMapping("/by-owner/{ownerId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public List<ResponseProjectDTO> getProjectsByOwnerId(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "true") boolean active) { // true = activos, false = inactivos
        return projectService.getProjectsByOwnerId(ownerId, active);
    }

    @PutMapping("/activate/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseProjectDTO> restoreProject(@PathVariable Long id) {
        ResponseProjectDTO restoredProject = projectService.activateProject(id);
        return ResponseEntity.status(HttpStatus.OK).body(restoredProject);
    }

    @PutMapping("/complete/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseProjectDTO> completeProject(@PathVariable Long projectId, @RequestParam Long ownerId) {
        ResponseProjectDTO responseProjectDTO = projectService.completeProject(projectId, ownerId);
        return ResponseEntity.ok(responseProjectDTO);
    }

    @PutMapping("/cancel/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseProjectDTO> cancelProject(@PathVariable Long id, @RequestParam Long ownerId) {
        ResponseProjectDTO responseProjectDTO = projectService.cancelProject(id, ownerId);
        return ResponseEntity.ok(responseProjectDTO);
    }

    @GetMapping("/tag/{tag}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<List<ResponseProjectDTO>> getProjectsByTag(@PathVariable String tag) {
        List<ResponseProjectDTO> projects = projectService.getProjectsByTag(tag);
        return ResponseEntity.status(HttpStatus.OK).body(projects);
    }

    @GetMapping("/by-investment/{investorId}")
    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    public ResponseEntity<List<ResponseProjectDTO>> getProjectsByInvestmentId(@PathVariable Long investorId) {
        List<ResponseProjectDTO> projects = projectService.getProjectsByInvestorId(investorId);
        return ResponseEntity.status(HttpStatus.OK).body(projects);
    }

    @PostMapping("/{projectId}/contact")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<Void> contactProjectOwner(
            @PathVariable Long projectId,
            @RequestBody @Valid ContactOwnerDTO contactOwnerDTO) {
        projectService.contactProjectOwner(projectId, contactOwnerDTO);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
