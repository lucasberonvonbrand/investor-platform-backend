import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

import { StudentsService, IStudent, University, Province, DegreeStatus } from '../../services/students.service';
import { AuthService } from '../../../auth/services/auth.service';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
  selector: 'app-student-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './student-profile-page.component.html',
  providers: [MessageService, ConfirmationService]
})
export class StudentProfilePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentsService);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  studentForm!: FormGroup;
  student = signal<IStudent | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  
  originalEmail = signal('');
  
  universities: { label: string, value: University }[];
  degreeStatuses: { label: string, value: DegreeStatus }[];
  provinces: { label: string, value: Province }[];

  constructor() {
    this.universities = Object.values(University).map(uni => ({ label: uni.replace(/_/g, ' '), value: uni }));
    this.provinces = Object.values(Province).map(prov => ({ label: this.formatProvinceForDisplay(prov), value: prov }));
    this.degreeStatuses = [
      { label: 'In Progress', value: DegreeStatus.IN_PROGRESS },
      { label: 'Completed', value: DegreeStatus.COMPLETED },
      { label: 'Suspended', value: DegreeStatus.SUSPENDED },
      { label: 'Abandoned', value: DegreeStatus.ABANDONED }
    ];
  }

  ngOnInit(): void {
    this.buildForm({} as IStudent);
    
    const session = this.auth.getSession();
    const userId = session?.id; // In original this was returning username, but here we expect the ID or username. Let's use getByUsername.
    const username = this.auth.userId; // Based on original code: this.auth.userId is actually the username
    const roles = session?.roles || [];

    if (roles.includes('ROLE_STUDENT') && username) {
      this.isLoading.set(true);
      this.studentService.getById(username!).subscribe({ // Modified to getById
        next: (student) => {
          this.student.set(student);
          this.originalEmail.set(student.email);
          this.buildForm(student);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading student profile:', err);
          this.isLoading.set(false);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile data' });
          this.router.navigateByUrl('/projects/catalog');
        }
      });
    } else {
      this.router.navigateByUrl('/projects/catalog');
    }
  }

  private buildForm(student: Partial<IStudent>) {
    this.studentForm = this.fb.group({
      username: [{ value: student.username ?? '', disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [student.email ?? '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
        [this.emailValidator()]
      ],
      firstName: [student.firstName ?? '', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      lastName: [student.lastName ?? '', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      dni: [{ value: student.dni ?? '', disabled: true }, [Validators.required, Validators.maxLength(20)]],
      phone: [student.phone ?? '', [Validators.required, Validators.maxLength(50)]],
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

  save() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.studentForm.updateValueAndValidity();
      this.toast.add({ severity: 'warn', summary: 'Attention', detail: 'Please fill in all required fields.' });
      return;
    }

    const currentStudent = this.student();
    if (!currentStudent?.id) return;

    this.isSaving.set(true);
    const formValue = this.studentForm.getRawValue();

    this.studentService.update(currentStudent.id, formValue).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully' });
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isSaving.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not save profile. Please try again.' });
      }
    });
  }

  cancel() {
    this.router.navigateByUrl('/projects/my-projects');
  }

  confirmDeleteAccount() {
    const currentStudent = this.student();
    if (!currentStudent?.id) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your account? This action is irreversible.',
      header: 'Delete Account',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'No, cancel',
      accept: () => {
        this.isSaving.set(true);
        this.studentService.deactivate(currentStudent.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Account Deleted', detail: 'Your account has been deleted. Redirecting...' });
            setTimeout(() => {
              this.auth.logout();
              this.router.navigateByUrl('/auth/login');
            }, 2500);
          },
          error: (err) => {
            this.isSaving.set(false);
            let detail = 'An unexpected error occurred. Please try again.';
            if (err.status === 409) {
              detail = 'Cannot delete your account because you have active projects or contracts. Contact support for assistance.';
            } else if (err.error?.message) {
              detail = err.error.message;
            }
            this.toast.add({ severity: 'error', summary: 'Error Deleting Account', detail: detail, life: 7000 });
          }
        });
      }
    });
  }

  private formatProvinceForDisplay(enumValue: string): string {
    return enumValue.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  isInvalidField(field: string, formGroup?: FormGroup): boolean {
    const form = formGroup || this.studentForm;
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string, formGroup?: FormGroup): string | null {
    const form = formGroup || this.studentForm;
    const control = form.get(field);
    if (!control || !control.errors || (!control.touched && !control.dirty)) return null;

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['email']) return 'Invalid email';
    if (errors['pattern']) return 'Invalid format';
    if (errors['futureDate']) return 'Date cannot be today or in the future.';
    if (errors['emailExists']) return 'Email is already in use.';

    return null;
  }

  private emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.value === this.originalEmail()) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => this.http.get<boolean>(`/api/users/check-email/${value}`)),
        map(exists => (exists ? { emailExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
