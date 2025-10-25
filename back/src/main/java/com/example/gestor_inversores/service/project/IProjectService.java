package com.example.gestor_inversores.service.project;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;

import java.util.List;

public interface IProjectService {

    ResponseProjectDTO save(RequestProjectDTO projectDTO);
    ResponseProjectDTO update(Long id, RequestProjectUpdateDTO projectDTO);
    void delete(Long id);
    List<ResponseProjectDTO> getAllProjects(boolean active);
    List<ResponseProjectStudentDTO> getStudentsByProject(Long projectId);
    ResponseProjectDTO findById(Long id);

    // Buscar por Student
    List<ResponseProjectDTO> getProjectsByOwner(Student owner);

    List<ResponseProjectDTO> getProjectsByOwnerId(Long ownerId, boolean active);

    ResponseProjectDTO activateProject(Long id);
    List<ResponseProjectDTO> getProjectsByTag(String tag);
    List<ResponseProjectDTO> getProjectsByInvestmentId(Long investmentId);

    ResponseProjectDTO completeProject(Long projectId, Long ownerId);

    ResponseProjectDTO cancelProject(Long projectId, Long ownerId);

}
