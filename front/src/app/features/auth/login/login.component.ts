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
  styles: [`
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes gradientBG { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    .bg-animated-gradient {
      background: linear-gradient(-45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab);
      background-size: 400% 400%;
      animation: gradientBG 15s ease infinite;
    }
    .floating { animation: float 6s ease-in-out infinite; }
    .pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
    .image-upload-container { transition: all .3s ease; }
    .image-upload-container:hover { transform: scale(1.05); }
    .image-preview { transition: all .3s ease; filter: drop-shadow(0 10px 15px rgba(0,0,0,.3)); }
    .image-preview:hover { filter: drop-shadow(0 20px 25px rgba(0,0,0,.4)); }
  `],
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
          this.router.navigateByUrl('/mismarquesinas', { replaceUrl: true });
        } else if (role.includes('STUDENT')) {
          this.router.navigateByUrl('/misproyectos', { replaceUrl: true });
        } else {
          // fallback
          this.router.navigateByUrl('/mismarquesinas', { replaceUrl: true });
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
