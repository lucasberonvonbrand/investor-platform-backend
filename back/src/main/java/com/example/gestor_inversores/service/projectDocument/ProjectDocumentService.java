package com.example.gestor_inversores.service.projectDocument;

import com.example.gestor_inversores.dto.ResponseFile;
import com.example.gestor_inversores.dto.ResponseProjectDocumentDTO;
import com.example.gestor_inversores.exception.DocumentFileException;
import com.example.gestor_inversores.exception.DocumentFileNotFoundException;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.ProjectDocument;
import com.example.gestor_inversores.repository.IProjectDocumentRepository;
import com.example.gestor_inversores.repository.IProjectRepository;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectDocumentService implements IProjectDocumentService {

    private final IProjectDocumentRepository documentRepository;
    private final IProjectRepository projectRepository;

    @Value("${app.upload.dir}")
    private String uploadFolder;

    @Transactional
    @Override
    public ResponseProjectDocumentDTO saveFile(MultipartFile file, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        try {

            Path folderPath = Paths.get(uploadFolder);

            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
            }

            String fileNameToSave = uploadFolder + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = folderPath.resolve(fileNameToSave);
            file.transferTo(filePath);

            ProjectDocument document = new ProjectDocument();
            document.setFileName(file.getOriginalFilename());
            document.setFilePath(filePath.toString());
            document.setProject(project);

            ProjectDocument saved = documentRepository.save(document);

            return ResponseProjectDocumentDTO.builder()
                    .idProjectDocument(saved.getIdProjectDocument())
                    .fileName(saved.getFileName())
                    .filePath(saved.getFilePath())
                    .projectId(saved.getProject().getIdProject())
                    .build();

        } catch (IOException | IllegalStateException e) {
            throw new DocumentFileException("Could not store file: " + e.getMessage());
        }
    }

    @Override
    public List<ResponseProjectDocumentDTO> getAllByProject(Long projectId) {
        return documentRepository.findByProject_IdProject(projectId).stream().map(d ->
                ResponseProjectDocumentDTO.builder()
                        .idProjectDocument(d.getIdProjectDocument())
                        .fileName(d.getFileName())
                        .filePath(d.getFilePath())
                        .projectId(d.getProject().getIdProject())
                        .build()
        ).toList();
    }

    @Override
    public ResponseProjectDocumentDTO findById(Long id) {
        ProjectDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentFileNotFoundException("Document not found"));

        return ResponseProjectDocumentDTO.builder()
                .idProjectDocument(doc.getIdProjectDocument())
                .fileName(doc.getFileName())
                .filePath(doc.getFilePath())
                .projectId(doc.getProject().getIdProject())
                .build();
    }


    @Transactional
    @Override
    public void delete(Long id) {
        ProjectDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentFileNotFoundException("Document not found"));

        Path filePath = Paths.get(doc.getFilePath());
        try {
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            } else {
                throw new DocumentFileNotFoundException("The file is not found on the server ");
            }
        } catch (IOException e) {
            throw new DocumentFileException("Could not delete file: " + e.getMessage());
        }

        Project project = doc.getProject();
        if (project != null) {
            project.getDocuments().remove(doc);
        }

        documentRepository.deleteById(id);
    }

    @Override
    public ResponseFile downloadFile(Long id) {
        ResponseProjectDocumentDTO dto = this.findById(id);

        Path filePath = Paths.get(dto.getFilePath());

        if (!Files.exists(filePath)) {
            throw new DocumentFileNotFoundException("The file with ID " + id + " was not found.");
        }

        Resource resource = new FileSystemResource(filePath.toFile());

        if (!resource.isReadable()) {
            throw new DocumentFileException("The file could not be read.");
        }

        String fileName = resource.getFilename();
        String contentType;
        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException e) {
            contentType = "application/octet-stream";
        }

        return new ResponseFile(resource, fileName, contentType);
    }
}
