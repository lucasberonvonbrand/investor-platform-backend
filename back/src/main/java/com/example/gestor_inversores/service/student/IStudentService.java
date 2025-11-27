package com.example.gestor_inversores.service.student;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.model.Student;

import java.util.List;
import java.util.Optional;

public interface IStudentService {

    ResponseStudentDTO findById(Long id);

    Student save(RequestStudentDTO dto);

    Optional<Student> patchStudent(Long id, RequestStudentUpdateDTO patchDto);

    void deleteById(Long id);

    Student activateStudent(Long id);

    Student desactivateStudent(Long id);

    ResponseStudentDTO findByDni(String dni);

    List<ResponseStudentDTO> findAll();

    List<ResponseStudentNameDTO> findAllStudentNames();

    List<ResponseProjectByStudentDTO> getProjectsByStudentId(Long studentId, boolean active);

    Optional<ResponseStudentDTO> findByUsername(String username);

    ResponseStudentDTO updateByAdmin(Long id, RequestStudentUpdateByAdminDTO dto);
}
