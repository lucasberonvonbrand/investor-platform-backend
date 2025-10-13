package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.mapper.StudentMapper;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.service.student.IStudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final IStudentService studentService;
    private final StudentMapper studentMapper;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<ResponseStudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseStudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<List<ResponseProjectByStudentDTO>> getProjectsByStudent(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean active) { // true = activos, false = inactivos

        List<ResponseProjectByStudentDTO> projects = studentService.getProjectsByStudentId(id, active);
        return ResponseEntity.ok(projects);
    }

    //Para poder mostrar la lista de alumnos cuando alguien crea un proyecto
    @GetMapping("/names")
    public ResponseEntity<List<ResponseStudentNameDTO>> getAllStudentNames() {
        List<ResponseStudentNameDTO> students = studentService.findAllStudentNames();
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<ResponseStudentDTO> createStudent(@Valid @RequestBody RequestStudentDTO requestDTO) {
        Student saved = studentService.save(requestDTO);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(saved));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ResponseStudentDTO> patchStudent(
            @PathVariable Long id,
            @RequestBody RequestStudentUpdateDTO patchDto) {

        return studentService.patchStudent(id, patchDto)
                .map(studentMapper::studentToResponseStudentDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DAR DE ALTA (enable)
    @PatchMapping("/activate/{id}")
    public ResponseEntity<ResponseStudentDTO> activateStudent(@PathVariable Long id) {
        Student student = studentService.activateStudent(id);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(student));
    }

    // DAR DE BAJA (disable)
    @PatchMapping("/desactivate/{id}")
    public ResponseEntity<ResponseStudentDTO> desactivateStudent(@PathVariable Long id) {
        Student student = studentService.desactivateStudent(id);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(student));
    }

    // 💡 PASO FINAL: Endpoint para buscar por nombre de usuario
    @GetMapping("/by-username/{username}")
    public ResponseEntity<ResponseStudentDTO> getStudentByUsername(@PathVariable String username) {
        return studentService.findByUsername(username) 
                .map(StudentMapper::studentToResponseStudentDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-username")
    public ResponseEntity<ResponseStudentDTO> getStudentByUsername(
            @RequestParam("username") String username) {

        return studentService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
