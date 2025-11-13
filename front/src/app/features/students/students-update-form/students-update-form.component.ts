import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router'

import { StudentService } from '../../../core/services/students.service';
import { AuthService } from '../../auth/login/auth.service'; // 👈 para leer el token/rol
import { Student, Province,University, DegreeStatus} from '../../../models/student.model';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { KeyFilterModule } from 'primeng/keyfilter';

/**
 * Validador personalizado para asegurar que la fecha sea anterior a la fecha actual.
 * @param control El control del formulario a validar.
 */
export function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // No validar si no hay valor
  }
  const controlDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Comparar solo fechas, sin la hora
  return controlDate < today ? null : { futureDate: true };
}
@Component({
  selector: 'app-students-update',
  templateUrl: './students-update-form.component.html',
  styleUrls: ['./students-update-form.component.scss'], 
  standalone: true,
  imports: [
    ReactiveFormsModule,CommonModule,ToastModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule,
    TooltipModule,    
    KeyFilterModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})

export class StudentsUpdateComponent implements OnInit {
 studentsUpdateForm!: FormGroup;
 student!: Student;
 isLoading = false;

  provinces: { label: string, value: Province }[];
  universities: { label: string, value: University }[];


 get addressFormGroup(): FormGroup {
 return this.studentsUpdateForm.get('address') as FormGroup;
  }

 constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private http: HttpClient,
    private auth: AuthService, // 👈 inyectamos AuthService
    private router: Router,
    private toast: MessageService,
    private confirmationService: ConfirmationService // Inyectar ConfirmationService
  ) { 
    this.universities = Object.values(University).map(uni => ({ label: uni.replace(/_/g, ' '), value: uni }));
    this.provinces = Object.values(Province).map(prov => ({ label: this.formatProvinceForDisplay(prov), value: prov }));
  }


  degreeStatuses = [
    { label: 'En curso', value: DegreeStatus.IN_PROGRESS },
    { label: 'Completado', value: DegreeStatus.COMPLETED },
    { label: 'Suspendido', value: DegreeStatus.SUSPENDED },
    { label: 'Abandonado', value: DegreeStatus.ABANDONED }
  ];

//////////////STUDENT SERVICE
ngOnInit(): void {

    this.buildForm({} as Student); 


    const userId = this.auth.userId; // Esto devuelve el 'username'
    const role = this.auth.getUserRole();


 if (role === 'ROLE_STUDENT' && userId) {
      this.isLoading = true;
      this.studentService.getById(userId).subscribe({
        next: (student) => {
          this.student = student;
          this.buildForm(student);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando estudiante:', err);
          this.isLoading = false;
          this.router.navigateByUrl('/dashboard');
        }
      });
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  

  private buildForm(student: Student) {
    this.studentsUpdateForm = this.fb.group({
      username: [{ value: student.username ?? '', disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [{ value: student.email ?? '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(100)]],
      firstName: [student.firstName ?? '', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      lastName: [student.lastName ?? '', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      dni: [{ value: student.dni ?? '', disabled: true }, [Validators.required, Validators.maxLength(20)]],
      phone: [student.phone ?? '', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      dateOfBirth: [student.dateOfBirth ?? '', [Validators.required, pastDateValidator]],
      university: [student.university ?? '', Validators.required],      
      career: [student.career ?? '', Validators.required],
      degreeStatus: [student.degreeStatus ?? '', Validators.required],
      linkedinUrl: [student.linkedinUrl ?? '', [Validators.pattern(/^(https?:\/\/.*|linkedin\.com\/.*)?$/)]],
      description: [student.description ?? '', Validators.maxLength(500)],
      address: this.fb.group({
        street: [student.address?.street ?? '', [Validators.required, Validators.maxLength(50)]],
        number: [student.address?.number ?? '', [Validators.required, Validators.maxLength(5)]],
        city: [student.address?.city ?? '', [Validators.required, Validators.maxLength(50)]],
        province: [student.address?.province ?? '', Validators.required],
        postalCode: [student.address?.postalCode ?? null, [Validators.required, Validators.maxLength(10)]]
      })
    });
  }

  guardar() {
    if (this.studentsUpdateForm.pristine) {
      this.toast.add({ severity: 'info', summary: 'Sin cambios', detail: 'No has realizado ninguna modificación.' });
      return;
    }

    if (this.studentsUpdateForm.invalid) {
      this.studentsUpdateForm.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos.' });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas guardar los cambios realizados en tu perfil?',
      header: 'Confirmar Cambios',
      icon: 'pi pi-save',
      acceptLabel: 'Sí, guardar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        const formValue = this.studentsUpdateForm.getRawValue();
        const apiUrl = `/api/students/${this.student.id}`;

        this.http.patch(apiUrl, formValue).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente' });
            this.studentsUpdateForm.markAsPristine(); // Resetea el estado del formulario para deshabilitar el botón de guardar
          },
          error: (err) => {
            console.error('Error actualizando perfil:', err);
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el perfil. Inténtalo de nuevo.' });
          }
        });
      }
    });
  }

  cancelar() {
    this.router.navigateByUrl('/proyectos-panel');
  }

  confirmDeleteAccount() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y tus datos no podrán ser recuperados.',
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isLoading = true;
        const apiUrl = `/api/students/desactivate/${this.student.id}`;
        this.http.patch(apiUrl, {}).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Cuenta Eliminada', detail: 'Tu cuenta ha sido eliminada. Serás redirigido.' });
            setTimeout(() => {
              this.auth.logout();
              this.router.navigateByUrl('/auth/login');
            }, 2500);
          },
          error: (err) => {
            this.isLoading = false;
            let detail = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
            if (err.status === 409) { // 409 Conflict
              detail = 'No es posible eliminar tu cuenta porque tienes proyectos o contratos activos. Para proceder, por favor, contacta a soporte para obtener asistencia.';
            } else if (err.error?.message) {
              detail = err.error.message;
            }
            this.toast.add({ severity: 'error', summary: 'Error al Eliminar', detail: detail, life: 7000 });
          }
        });
      }
    });
  }

  // Helper para formatear las provincias en los desplegables
  private formatProvinceForDisplay(enumValue: string): string {
    return enumValue.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  isInvalidField(field: string, formGroup?: FormGroup): boolean {
    const form = formGroup || this.studentsUpdateForm;
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string, formGroup?: FormGroup): string | null {
    const form = formGroup || this.studentsUpdateForm;
    const control = form.get(field);
    if (!control || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Email inválido';
    if (errors['pattern']) return 'Formato inválido';
    if (errors['futureDate']) return 'La fecha no puede ser hoy ni futura.';

    return null;
  }

}
