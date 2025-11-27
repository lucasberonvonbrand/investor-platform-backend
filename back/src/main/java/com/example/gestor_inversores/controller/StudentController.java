package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.mapper.StudentMapper;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.repository.IStudentRepository;
import com.example.gestor_inversores.repository.IUserRepository;
import com.example.gestor_inversores.service.student.IStudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final IStudentService studentService;
    private final StudentMapper studentMapper;
    private final IUserRepository userRepository;
    private final IStudentRepository studentRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResponseStudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ResponseStudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping("/projects/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<ResponseProjectByStudentDTO>> getProjectsByStudent(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean active) {

        List<ResponseProjectByStudentDTO> projects = studentService.getProjectsByStudentId(id, active);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/names")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ResponseStudentNameDTO>> getAllStudentNames() {
        List<ResponseStudentNameDTO> students = studentService.findAllStudentNames();
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<ResponseStudentDTO> createStudent(@Valid @RequestBody RequestStudentDTO requestDTO) {
        Student saved = studentService.save(requestDTO);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(saved));
    }

    @PutMapping("/update-by-admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseStudentDTO> updateByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody RequestStudentUpdateByAdminDTO dto) {
        ResponseStudentDTO updatedStudent = studentService.updateByAdmin(id, dto);
        return ResponseEntity.ok(updatedStudent);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseStudentDTO> patchStudent(
            @PathVariable Long id,
            @RequestBody RequestStudentUpdateDTO patchDto) {

        return studentService.patchStudent(id, patchDto)
                .map(studentMapper::studentToResponseStudentDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/activate/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseStudentDTO> activateStudent(@PathVariable Long id) {
        Student student = studentService.activateStudent(id);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(student));
    }

    @PatchMapping("/desactivate/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ResponseStudentDTO> desactivateStudent(@PathVariable Long id) {
        Student student = studentService.desactivateStudent(id);
        return ResponseEntity.ok(studentMapper.studentToResponseStudentDTO(student));
    }


    @GetMapping("/by-username")
    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    public ResponseEntity<ResponseStudentDTO> getStudentByUsername(
            @RequestParam("username") String username) {

        return studentService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsernameExists(@PathVariable String username) {
        return ResponseEntity.ok(userRepository.findUserEntityByUsername(username).isPresent());
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        return ResponseEntity.ok(userRepository.findByEmail(email).isPresent());
    }

    @GetMapping("/check-dni/{dni}")
    public ResponseEntity<Boolean> checkDniExists(@PathVariable String dni) {
        return ResponseEntity.ok(studentRepository.findByDni(dni).isPresent());
    }
}
