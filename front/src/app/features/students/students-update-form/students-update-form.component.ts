import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DegreeStatus, Province, University } from '../../../models/student.model'; // Corrige la ruta si es necesario
import { Router } from '@angular/router'

// AGREGADO PARA EL STUDENT SERVICE
import { StudentService } from '../../../core/services/students.service';
import { AuthService } from '../../auth/login/auth.service'; // 👈 para leer el token/rol
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Student } from '../../../models/student.model';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-students-update',
  templateUrl: './students-update-form.component.html',
  styleUrls: ['./students-update-form.component.scss'], 
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ToastModule, CardModule, ButtonModule, InputTextModule
  ],
  providers: [MessageService]
})


export class StudentsUpdateComponent implements OnInit {

// Nuevo studentsUpdateForm con valores iniciales vacíos
studentsUpdateForm: FormGroup = this.fb.group({
  username: [''], email: [''],
  firstName: [''], lastName: [''], dni: [''], phone: [''], dateOfBirth: [''],
  university: [''], career: [''], degreeStatus: [''],
  linkedinUrl: [''], description: [''],
  address: this.fb.group({
    street: [''],
    number: [null],
    city: [''],
    province: [''],
    postalCode: [null]
  })
});


  student!: Student;

  isLoading: boolean = false;
  progress: number = 0; 

////constructor(private fb: FormBuilder) {} COMENTADO POR EL STUDENT SERVICE
 constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private auth: AuthService, // 👈 inyectamos AuthService
    private router: Router,
    private toast: MessageService
  ) {}



  // Arrays para los desplegables
  provinces = Object.values(Province);
  universities = Object.values(University);
  degreeStatuses = [
    { label: 'En curso', value: DegreeStatus.IN_PROGRESS },
    { label: 'Completado', value: DegreeStatus.COMPLETED },
    { label: 'Suspendido', value: DegreeStatus.SUSPENDED },
    { label: 'Abandonado', value: DegreeStatus.ABANDONED }
  ];

//////////////STUDENT SERVICE
ngOnInit(): void {

    console.log('TRACE 1: Ejecutando ngOnInit...');
    // 1. Inicializa el formulario con valores vacíos (¡con validadores!) antes de la llamada.
    // Esto evita el error "Cannot find control with name:..."
    this.buildForm({} as Student); 
    console.log('TRACE 2: Formulario inicializado con estructura vacía.');


    const username = this.auth.getUserId(); // Esto devuelve el 'username'
    const role = this.auth.getUserRole();
    
    //console.log('🔍 Token actual:', localStorage.getItem('auth_token'));
    console.log('🔍 username:', username, 'role:', role);

 if (role === 'ROLE_STUDENT' && username) {
      console.log(`TRACE 3: Usuario '${username}' es estudiante. Iniciando llamada API...`);
      this.isLoading = true;
      this.studentService.getByUsername(username).subscribe({
        next: (student) => {
          console.log('TRACE 4: ¡Éxito! Datos recibidos:', student);
          this.student = student;
          this.studentsUpdateForm.patchValue(student);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando estudiante:', err);
          this.isLoading = false;
          this.router.navigateByUrl('/configuracion');
        }
      });
    } else {
      this.router.navigateByUrl('/configuracion');
    }
  }

  

  private buildForm(student: Student) {
    this.studentsUpdateForm = this.fb.group({
      username: [student.username ?? '', [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9 ./,!&]+$')]],
      email: [student.email ?? '', [Validators.required, Validators.email]],

      firstName: [student.firstName ?? '', [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
      lastName: [student.lastName ?? '', [Validators.required, Validators.maxLength(20), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
      dni: [student.dni ?? '', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      phone: [student.phone ?? '', [Validators.required, Validators.maxLength(13), Validators.pattern('^[0-9]+$')]],
      dateOfBirth: [student.dateOfBirth ?? '', Validators.required],
      university: [student.university ?? '', Validators.required],      
      career: [student.career ?? '', Validators.required],
      degreeStatus: [student.degreeStatus ?? '', Validators.required],
      linkedinUrl: [student.linkedinUrl ?? '', [Validators.pattern('https?://.+')]],
      description: [student.description ?? '', Validators.maxLength(500)],
      address: this.fb.group({
        street: [student.address?.street ?? '', Validators.required],
        number: [student.address?.number ?? null, Validators.required],
        city: [student.address?.city ?? '', Validators.required],
        province: [student.address?.province ?? '', Validators.required],
        postalCode: [student.address?.postalCode ?? null, Validators.required]
      })
    });
  }

  guardar() {
    if (this.studentsUpdateForm.invalid) {
      this.studentsUpdateForm.markAllAsTouched();
      this.studentsUpdateForm.updateValueAndValidity();
      this.toast.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos.' });
      return;
    }

    this.studentService.update(this.student.id, this.studentsUpdateForm.value).subscribe({
      next: (updated) => {
        console.log('Perfil actualizado:', updated);
        this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente.' });
      },
      error: (err) => {
        console.error('Error actualizando perfil:', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el perfil.' });
      }
    });
  }

  cancelar() {
    this.router.navigateByUrl('/proyectos-panel');
  }
}
