import { Component, ElementRef, ViewChild, inject, signal, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "./auth.service";
import type { AuthError } from "../shared/auth-errors";
import { AuthErrorModalComponent } from "../shared/auth-error-modal.component";

@Component({
  standalone: true,
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthErrorModalComponent],
  templateUrl: "./login.component.html",
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  form = this.fb.group({
    username: ["", [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  serverError = signal<AuthError | null>(null);
  masked = signal(true);

  // imagen (opcional)
  previewDataUrl = signal<string | null>(null);
  dragOver = signal(false);

  private subs = new Subscription();

  constructor() {
    // limpio el modal al editar el formulario
    this.subs.add(
      this.form.valueChanges.subscribe(() => {
        if (this.serverError()) this.serverError.set(null);
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ========= helpers de mensaje para el modal =========
  messageFor(err: AuthError): string {
    if (!err) return "";
    const base = err.title?.endsWith(".") ? err.title.slice(0, -1) : err.title;
    const det = err.detail ?? "";
    return det && det !== err.title ? `${base}. — ${det}` : base;
  }

  // ========= Imagen =========
  openFilePicker() { this.fileInput?.nativeElement.click(); }
  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => this.previewDataUrl.set(String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  }
  onDragOver(e: DragEvent) { e.preventDefault(); this.dragOver.set(true); }
  onDragLeave() { this.dragOver.set(false); }
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => this.previewDataUrl.set(String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  }
  removeImage() {
    this.previewDataUrl.set(null);
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = "";
  }

  // ========= Validaciones UI =========
  showError(ctrl: "username" | "password") {
    const c = this.form.get(ctrl)!;
    return (c.touched || c.dirty) && c.invalid;
  }
  toggleMask() { this.masked.update(v => !v); }

  // ========= Submit =========
  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.serverError.set(null);

    const { username, password } = this.form.getRawValue();

    this.auth.login(username!, password!).subscribe({
      next: () => {
        // auth.login ya persiste la sesión; ahora leemos el rol
        const role = (this.auth.getUserRole() || '').toUpperCase();

        if (role.includes('INVESTOR')) {
          this.router.navigateByUrl('/marquesinas', { replaceUrl: true });
        } else if (role.includes('STUDENT')) {
          this.router.navigateByUrl('/misproyectos', { replaceUrl: true });
        } else {
          // fallback
          this.router.navigateByUrl('/marquesinas', { replaceUrl: true });
        }
      },
      error: (err) => {
        this.serverError.set(err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
