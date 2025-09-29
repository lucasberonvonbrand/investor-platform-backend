import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message'; // agregado para msj de error primeng

@Component({
  selector: 'app-students-update',
  templateUrl: './students-update-form.component.html',
  styleUrls: ['./students-update-form.component.scss'], 
  standalone: true,
  imports: [
  ReactiveFormsModule,
  MessageModule // agregado para msj de error primeng
],
})


export class StudentsUpdateComponent implements OnInit {
  // Propiedad para el formulario reactivo, inicializada en ngOnInit ...
  studentsUpdateForm!: FormGroup;
  
  // Propiedad para almacenar el archivo seleccionado (imagen o documento)
  selectedFile: { file: File, url: string } | null = null;

  // Propiedades para la pantalla de carga
  isLoading: boolean = false; 
  progress: number = 0; 

  // Constructor: inyección de dependencias como FormBuilder
  //constructor(private fb: FormBuilder) {}
constructor(private fb: FormBuilder) {}


student = {
  id: 1,
  username: 'juan123',
  password: '',
  email: 'juan@example.com',
  enabled: true,
  accountNotExpired: true,
  accountNotLocked: true,
  credentialNotExpired: true,
  nombre: 'Juan',
  apellido: 'Pérez',
  dni: '12345678',
  telefono: '123456789',
  fechaNacimiento: '1995-04-10',
  universidad: "University.UBA",
  carrera: 'Ingeniería',
  degreeStatus: "DegreeStatus.IN_PROGRESS",
  redSocial: 'https://facebook.com/juanperez'
};


ngOnInit(): void {
    // Cargar los datos del usuario en el formulario
    this.studentsUpdateForm = this.fb.group({
      nombre: 
      [
        this.student.nombre,
         [
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern('^[A-Za-zÀ-ÿ ]+$')
        ]
      ],
      apellido: [
        this.student.apellido,
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-zÀ-ÿ ]+$')
        ]
      ],
      dni: 
      [
        this.student.dni, 
        [
          Validators.required,
          Validators.maxLength(8),
          Validators.pattern('^[0-9]+$')
        ]
      ],
      fechaNacimiento: 
      [
        this.student.fechaNacimiento,
          Validators.required
      ],
      facebook: 
      [
        this.student.redSocial,
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern('^[A-Za-zÀ-ÿ ]+$')
        ]
      ],
      CarreraEstado: [null, Validators.required]
    });
  }


/*
  guardar() {
    if (this.studentsUpdateForm.valid) {
      console.log('Datos guardados:', this.studentsUpdateForm.value);
      alert('Perfil actualizado con éxito ✅');
    } else {
      alert('Por favor, completa los campos requeridos ❌');
    }
  }
*/

cancelar() {
    console.log('Cancelado, datos actuales:', this.studentsUpdateForm.value);
  }
  
guardar() {
  if (this.studentsUpdateForm.invalid) {
    // Marcar todos los campos como tocados para que aparezcan los errores
    this.studentsUpdateForm.markAllAsTouched();
    return; // no guardar si hay errores
  }

  // Aquí ya el formulario es válido
  console.log('Formulario válido, datos a enviar:', this.studentsUpdateForm.value);

  // Lógica para enviar los datos al backend o actualizar el usuario
}

}


