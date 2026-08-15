import { Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { InvestorsService, IInvestor, Province } from '../../services/investors.service';

@Component({
  selector: 'app-investor-registration-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, ButtonModule, TooltipModule],
  templateUrl: './investor-registration-page.component.html'
})
export class InvestorRegistrationPageComponent implements OnInit {
  private service = inject(InvestorsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  provinces: { label: string, value: Province }[];

  successMessage = signal('');
  showModal = signal(false);
  isSubmitting = signal(false);

  form!: FormGroup;

  constructor() {
    this.provinces = Object.values(Province).map(prov => ({ label: this.formatProvinceForDisplay(prov), value: prov }));
  }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['',
        [Validators.required, Validators.maxLength(50), Validators.minLength(3)],
        [this.usernameValidator()]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['',
        [Validators.required, Validators.email, Validators.maxLength(100)],
        [this.emailValidator()]
      ],
      cuit: ['',
        [Validators.required, Validators.minLength(11), Validators.maxLength(11)],
        [this.cuitValidator()]
      ],
      contactPerson: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      webSite: ['', [Validators.maxLength(100)]],
      linkedinUrl: ['', Validators.pattern(/^(https?:\/\/.*|linkedin\.com\/.*)?$/)],
      description: ['', Validators.maxLength(500)],
      street: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const f = this.form.getRawValue();
    const investorData: Partial<IInvestor> = {
      username: f.username!,
      password: f.password!,
      email: f.email!,
      cuit: f.cuit!,
      contactPerson: f.contactPerson!,
      phone: f.phone!,
      webSite: f.webSite!,
      linkedinUrl: f.linkedinUrl!,
      description: f.description!,
      address: {
        street: f.street!,
        number: Number(f.number),
        city: f.city!,
        province: f.province as Province, 
        postalCode: Number(f.postalCode)
      }
    };

    this.service.create(investorData).subscribe({
      next: () => {
        this.successMessage.set('¡Inversor registrado con éxito!');
        this.showModal.set(true);
        this.isSubmitting.set(false);
        this.form.reset();
        setTimeout(() => {
          this.showModal.set(false);
          this.router.navigateByUrl('/auth/login', { replaceUrl: true });
        }, 2000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Error al registrar el inversor. Por favor revisá tus datos.');
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
    if (errors['pattern']) return 'Formato inválido';
    if (errors['email']) return 'Correo electrónico inválido';
    if (errors['usernameExists']) return 'El nombre de usuario ya está registrado';
    if (errors['emailExists']) return 'El correo electrónico ya está registrado';
    if (errors['cuitExists']) return 'El CUIT ya está registrado';

    return null;
  }

  private usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): any => {
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
    return (control: AbstractControl): any => {
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

  private cuitValidator(): AsyncValidatorFn {
    return (control: AbstractControl): any => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => this.http.get<boolean>(`/api/investors/check-cuit/${value}`)),
        map(exists => (exists ? { cuitExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
