package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.ResponseFile;
import com.example.gestor_inversores.dto.ResponseProjectDocumentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.gestor_inversores.service.projectDocument.IProjectDocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/project-documents")
@RequiredArgsConstructor
public class ProjectDocumentController {

    private final IProjectDocumentService projectDocumentService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ResponseProjectDocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId) {

        ResponseProjectDocumentDTO response = projectDocumentService.saveFile(file, projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<List<ResponseProjectDocumentDTO>> getAllByProject(@PathVariable Long projectId) {
        List<ResponseProjectDocumentDTO> list = projectDocumentService.getAllByProject(projectId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectDocumentService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        ResponseFile fileData = projectDocumentService.downloadFile(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileData.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(fileData.getContentType()))
                .body(fileData.getResource());
    }


}
