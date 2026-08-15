import { Component, EventEmitter, inject, Input, Output, signal, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

import { StudentsService, IStudent, University, Province, DegreeStatus } from '../../services/students.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { KeyFilterModule } from 'primeng/keyfilter';

export function pastDateValidator(control: AbstractControl) {
  if (!control.value) {
    return null;
  }
  const controlDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return controlDate < today ? null : { futureDate: true };
}

@Component({
  selector: 'app-student-registration-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, RouterLink, 
    InputTextModule, ButtonModule, KeyFilterModule, TooltipModule
  ],
  templateUrl: './student-registration-page.component.html'
})
export class StudentRegistrationPageComponent implements OnInit {
  private service = inject(StudentsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  @Input() isModal = false;
  @Output() userCreated = new EventEmitter<void>();

  universities: { label: string, value: University }[];
  degreeStatuses: { label: string, value: DegreeStatus }[];
  provinces: { label: string, value: Province }[];

  successMessage = signal('');
  showModal = signal(false);
  isSubmitting = signal(false);

  form!: FormGroup;

  constructor() {
    this.universities = Object.values(University).map(uni => ({ label: uni.replace(/_/g, ' '), value: uni }));
    this.provinces = Object.values(Province).map(prov => ({ label: this.formatProvinceForDisplay(prov), value: prov }));
    this.degreeStatuses = [
      { label: 'En Progreso', value: DegreeStatus.IN_PROGRESS },
      { label: 'Completado', value: DegreeStatus.COMPLETED },
      { label: 'Suspendido', value: DegreeStatus.SUSPENDED },
      { label: 'Abandonado', value: DegreeStatus.ABANDONED }
    ];
  }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['',
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
        [this.usernameValidator()]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['',
        [Validators.required, Validators.email, Validators.maxLength(100)],
        [this.emailValidator()]
      ],
      firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      dni: ['',
        [Validators.required, Validators.maxLength(20)],
        [this.dniValidator()]
      ],
      phone: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: ['', [Validators.required, pastDateValidator]],
      career: ['', Validators.required],
      university: ['', Validators.required],
      degreeStatus: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      linkedinUrl: ['', Validators.pattern(/^(https?:\/\/.*|linkedin\.com\/.*)?$/)],
      description: ['', Validators.maxLength(500)]
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const f = this.form.getRawValue();
    const studentData: Partial<IStudent> = {
      username: f.username!,
      password: f.password!,
      email: f.email!,
      firstName: f.firstName!,
      lastName: f.lastName!,
      dni: f.dni!,
      phone: f.phone!,
      dateOfBirth: f.dateOfBirth!,
      career: f.career!,
      university: f.university! as University,
      degreeStatus: f.degreeStatus! as DegreeStatus,
      address: {
        street: f.street!,
        number: Number(f.number),
        city: f.city!,
        province: f.province! as Province,
        postalCode: Number(f.postalCode)
      },
      linkedinUrl: f.linkedinUrl!,
      description: f.description!
    };

    this.service.create(studentData).subscribe({
      next: () => {
        this.successMessage.set('¡Cuenta registrada con éxito!');
        this.showModal.set(true);
        this.isSubmitting.set(false);
        this.form.reset();

        if (this.isModal) {
          this.userCreated.emit();
        } else {
          setTimeout(() => {
            this.showModal.set(false);
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          }, 2000);
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Error al registrar la cuenta. Por favor revisá los campos e intentá nuevamente.');
      }
    });
  }

  isInvalidField(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  private formatProvinceForDisplay(enumValue: string): string {
    return enumValue.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !control.errors || (!control.touched && !control.dirty)) return null;

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Correo electrónico inválido';
    if (errors['pattern']) return 'Formato inválido';
    if (errors['futureDate']) return 'La fecha no puede ser futura';
    if (errors['usernameExists']) return 'El nombre de usuario ya está registrado';
    if (errors['emailExists']) return 'El correo electrónico ya está registrado';
    if (errors['dniExists']) return 'El DNI ya está registrado';

    return null;
  }

  private usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => this.http.get<boolean>(`/api/users/check-username/${value}`)),
        map(exists => (exists ? { usernameExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  private emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => this.http.get<boolean>(`/api/users/check-email/${value}`)),
        map(exists => (exists ? { emailExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  private dniValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => this.http.get<boolean>(`/api/students/check-dni/${value}`)),
        map(exists => (exists ? { dniExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
