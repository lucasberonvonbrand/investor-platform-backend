package com.example.gestor_inversores.service.project;

import com.example.gestor_inversores.dto.*;

import java.util.List;

public interface IProjectService {

    ResponseProjectDTO save(RequestProjectDTO projectDTO);
    ResponseProjectDTO update(Long id, RequestProjectUpdateDTO projectDTO);
    void delete(Long id);
    List<ResponseProjectDTO> getAllProjects();
    List<ResponseProjectStudentDTO> getStudentsByProject(Long projectId);
    ResponseProjectDTO findById(Long id);
}
