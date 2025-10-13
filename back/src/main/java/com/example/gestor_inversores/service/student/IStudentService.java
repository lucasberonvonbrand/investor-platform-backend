package com.example.gestor_inversores.service.student;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.model.Student;

import java.util.List;
import java.util.Optional;

public interface IStudentService {

    List<ResponseStudentDTO> findAll();

    ResponseStudentDTO findById(Long id);

    ResponseStudentDTO findByDni(String dni);

    Student save(RequestStudentDTO student);

    void deleteById(Long id);

    Optional<Student> patchStudent(Long id, RequestStudentUpdateDTO patchDto);

    Student activateStudent(Long id);

    Student desactivateStudent(Long id);

    List<ResponseStudentNameDTO> findAllStudentNames();
  
    Optional<ResponseStudentDTO> findByUsername(String username);

    List<ResponseProjectByStudentDTO> getProjectsByStudentId(Long studentId, boolean active);


}
