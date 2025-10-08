package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IStudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByDni(String dni);

     // 💡 NUEVO MÉTODO: Buscar un Student por su username
    // Spring Data JPA generará automáticamente el SQL para buscar por el campo 'username'
    Optional<Student> findByUsername(String username); // 👈 ¡Añade esta línea!

}
