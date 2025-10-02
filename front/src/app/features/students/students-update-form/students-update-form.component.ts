import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DegreeStatus, Province, University } from '../../../models/student.model'; // Corrige la ruta si es necesario

@Component({
  selector: 'app-students-update',
  templateUrl: './students-update-form.component.html',
  styleUrls: ['./students-update-form.component.scss'], 
  standalone: true,
  imports: [
  ReactiveFormsModule,
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
constructor(private fb: FormBuilder) {}

  // Arrays para los desplegables
  provinces = Object.values(Province);
  universities = Object.values(University);
  degreeStatuses = Object.values(DegreeStatus);


student = {
    id: 1,
    username: 'juan123',
    password: '',
    email: 'juan@example.com',
    enabled: true,
    accountNotExpired: true,
    accountNotLocked: true,
    credentialNotExpired: true,
    firstName: 'Juan',
    lastName: 'Pérez',
    dni: '12345678',
    phone: '123456789',
    dateOfBirth: '1995-04-10',
    university: University.UBA,
    career: 'Ingeniería',
    degreeStatus: DegreeStatus.IN_PROGRESS,
    linkedinUrl: 'https://facebook.com/juanperez'
  };


 ngOnInit(): void {
    this.studentsUpdateForm = this.fb.group({
      username: [this.student.username, [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9 ./,!&]+$')]],
      email: [this.student.email, [Validators.required, Validators.email]],
      firstName: [this.student.firstName, [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
      lastName: [this.student.lastName, [Validators.required, Validators.maxLength(20), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
      dni: [this.student.dni, [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      phone: [this.student.phone, [Validators.required, Validators.maxLength(13), Validators.pattern('^[0-9]+$')]],
      dateOfBirth: [this.student.dateOfBirth, Validators.required],
      university: [this.student.university, Validators.required],
      career: [this.student.career, Validators.required],
      degreeStatus: [this.student.degreeStatus, Validators.required],
      linkedinUrl: [this.student.linkedinUrl, [Validators.pattern('https?://.+')]]
    });
  }
/*
ngOnInit(): void {
    // Cargar los datos del usuario en el formulario
    this.studentsUpdateForm = this.fb.group({
      username: 
      [
        this.student.username,
         [
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern('^[A-Za-z0-9 ./,!&]]+$')
        ]
      ],
      email: 
      [
        this.student.email,
         [
          Validators.required,
        ]
      ],
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
      telefono: 
      [
        this.student.dni, 
        [
          Validators.required,
          Validators.maxLength(13),
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
          Validators.maxLength(20)
        ]
      ],
      CarreraEstado: [null, Validators.required]
    });
  }
*/

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


