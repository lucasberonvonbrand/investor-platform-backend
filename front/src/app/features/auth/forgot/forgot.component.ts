import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ForgotPasswordService } from "../../../core/services/forgot-password.service";

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: "app-forgot",
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule],
  template: `
    <div class="min-h-screen grid place-items-center p-6 bg-gray-100 dark:bg-gray-900">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 backdrop-blur">
        <div class="text-center">
          <i class="pi pi-key text-5xl text-primary-500 mb-3"></i>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Recuperar Contraseña</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Ingresa tu email y te enviaremos un enlace para restablecerla.</p>
        </div>

        <!-- Mensaje de éxito -->
        <div *ngIf="success()" class="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md" role="alert">
          <p class="font-bold">¡Correo enviado!</p>
          <p>{{ successMsg() }}</p>
        </div>

        <!-- Formulario -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!success()">
          <div class="field">
            <label for="email" class="font-medium">Email</label>
            <input id="email" type="email" pInputText formControlName="email" class="w-full mt-1" />
            <small *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="p-error">
              Por favor, ingresa un email válido.
            </small>
          </div>

          <div class="mt-6">
            <button pButton type="submit" label="Enviar enlace" class="w-full" [loading]="loading()" [disabled]="form.invalid"></button>
          </div>
        </form>

        <!-- Mensaje de error del servidor -->
        <div *ngIf="serverError()" class="text-red-500 text-sm text-center mt-2">
          {{ serverError() }}
        </div>

        <!-- Volver al Login -->
        <div class="text-center text-sm">
          <a routerLink="/auth/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotComponent {
  private fb = inject(FormBuilder);
  private forgotSvc = inject(ForgotPasswordService);

  loading = signal(false);
  success = signal(false);
  successMsg = signal("");
  serverError = signal("");

  form = this.fb.group({ email: ["", [Validators.required, Validators.email]] });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.serverError.set("");

    this.forgotSvc.requestReset(this.form.value.email!).subscribe({
      next: (res) => { this.success.set(true); this.successMsg.set(res.message); },
      error: (err: Error) => this.serverError.set(err.message),
      complete: () => this.loading.set(false),
    });
  }
}