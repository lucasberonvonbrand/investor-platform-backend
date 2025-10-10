package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.ResponseProjectStudentDTO;
import com.example.gestor_inversores.model.Student;

public class ProjectStudentMapper {

    private ProjectStudentMapper() {}

    public static ResponseProjectStudentDTO studentToResponseProjectStudentDTO(Student student) {
        return ResponseProjectStudentDTO.builder()
                .id(student.getId())
                .name(student.getFirstName() + " " + student.getLastName())
                .build();
    }

}
