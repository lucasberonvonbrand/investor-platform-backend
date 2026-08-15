import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

import { InvestorsService, IInvestor, Province } from '../../services/investors.service';
import { AuthService } from '../../../auth/services/auth.service';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-investor-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, ToastModule, 
    CardModule, ButtonModule, InputTextModule, TooltipModule, ConfirmDialogModule
  ],
  templateUrl: './investor-profile-page.component.html',
  providers: [MessageService, ConfirmationService]
})
export class InvestorProfilePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private investorService = inject(InvestorsService);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  investorForm!: FormGroup;
  investor = signal<IInvestor | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  
  originalEmail = signal('');
  provinces: { label: string, value: Province }[];

  constructor() {
    this.provinces = Object.values(Province).map(prov => ({ label: this.formatProvinceForDisplay(prov), value: prov }));
  }

  ngOnInit(): void {
    this.buildForm({} as IInvestor);
    
    const session = this.auth.getSession();
    const userId = session?.id;
    const roles = session?.roles || [];

    if (roles.includes('ROLE_INVESTOR') && userId) {
      this.isLoading.set(true);
      this.investorService.getById(userId).subscribe({
        next: (investor) => {
          this.investor.set(investor);
          this.originalEmail.set(investor.email);
          this.buildForm(investor);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading investor profile:', err);
          this.isLoading.set(false);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile data' });
          this.router.navigateByUrl('/projects/catalog');
        }
      });
    } else {
      this.router.navigateByUrl('/projects/catalog');
    }
  }

  private buildForm(investor: Partial<IInvestor>) {
    this.investorForm = this.fb.group({
      username: [{ value: investor.username ?? '', disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [investor.email ?? '',
        [Validators.required, Validators.email],
        [this.emailValidator()]
      ],
      cuit: [{ value: investor.cuit ?? '', disabled: true }, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      contactPerson: [investor.contactPerson ?? '', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]*$')]],
      phone: [investor.phone ?? '', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      webSite: [investor.webSite ?? '', [Validators.maxLength(100)]],
      linkedinUrl: [investor.linkedinUrl ?? '', [Validators.pattern(/^(https?:\/\/.*|linkedin\.com\/.*)?$/)]],
      description: [investor.description ?? '', Validators.maxLength(500)],
      address: this.fb.group({
        street: [investor.address?.street ?? '', Validators.required],
        number: [investor.address?.number ?? '', Validators.required],
        city: [investor.address?.city ?? '', Validators.required],
        province: [investor.address?.province ?? '', Validators.required],
        postalCode: [investor.address?.postalCode ?? null, Validators.required]
      })
    });
  }

  save() {
    if (this.investorForm.invalid) {
      this.investorForm.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Attention', detail: 'Please fill in all required fields.' });
      return;
    }

    const currentInvestor = this.investor();
    if (!currentInvestor?.id) return;

    this.isSaving.set(true);
    const formValue = this.investorForm.getRawValue();
    const apiUrl = `/api/investors/${currentInvestor.id}`;

    this.http.patch(apiUrl, formValue).subscribe({
      next: () => {
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
    this.router.navigateByUrl('/projects/catalog');
  }

  confirmDeleteAccount() {
    const currentInvestor = this.investor();
    if (!currentInvestor?.id) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your account? This action is irreversible.',
      header: 'Delete Account',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'No, cancel',
      accept: () => {
        this.isSaving.set(true);
        const apiUrl = `/api/investors/desactivate/${currentInvestor.id}`;
        this.http.patch(apiUrl, {}).subscribe({
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
              detail = 'Cannot delete your account because you have active investments or contracts. Contact support for assistance.';
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
    const form = formGroup || this.investorForm;
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string, formGroup?: FormGroup): string | null {
    const form = formGroup || this.investorForm;
    const control = form.get(field);
    if (!control || !control.errors || (!control.touched && !control.dirty)) return null;

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['email']) return 'Invalid email';
    if (errors['pattern']) return 'Invalid format';
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
