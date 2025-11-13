// src/app/features/proyectos/proyectos.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectsService, CreateProjectDto, ProjectStatus } from '../../core/services/projects.service';
import { StudentService } from '../../core/services/students.service';
import { AuthService } from '../auth/login/auth.service';
import { StudentName } from '../../models/student-name.model';

// Garantizamos fullName en el componente
type StudentWithFullName = StudentName & { fullName: string };

@Component({
  selector: 'app-create-project',
  standalone: true,
  templateUrl: './crear-proyectos.component.html',
  styleUrls: ['./crear-proyectos.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ToastModule,
    CardModule,
    InputTextModule, // InputTextarea está incluido en InputTextModule en algunas versiones
    ButtonModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
})
export class ProyectosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectsSrv = inject(ProjectsService);
  private studentSrv = inject(StudentService);
  private msg = inject(MessageService);
  private authSvc = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  projectForm!: FormGroup;

  // UI carga / progreso
  creationState: 'idle' | 'creating' | 'success' = 'idle';
  get isLoading(): boolean { return this.creationState === 'creating'; }
  assignedTag: string = ''; // Para guardar la etiqueta de la IA

  loadingMessages = [
    'Analizando descripción del proyecto...',
    'Identificando palabras clave con IA...',
    'Evaluando viabilidad del presupuesto...',
    'Asignando categoría principal...',
    'Generando perfil de riesgo inicial...',
    'Finalizando creación del proyecto...'
  ];
  currentLoadingMessage = '';
  // Data para autocompletes
  allStudents: StudentWithFullName[] = [];
  studentsLoading = false;
  suggestionsStudents: StudentWithFullName[] = [];

  ngOnInit(): void {
    const currentUser = this.authSvc.getSession();
    const ownerForForm: StudentWithFullName | null = currentUser
      ? {
          id: currentUser.id,
          firstName: currentUser.username, // Usamos username como fallback
          lastName: '',
          fullName: currentUser.username,
        }
      : null;

    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      budgetGoal: [null, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],          // 'YYYY-MM-DD'
      estimatedEndDate: ['', Validators.required],   // 'YYYY-MM-DD'
      owner: [{ value: ownerForForm, disabled: true }, Validators.required],
      students: [[] as StudentWithFullName[]],
    });
  }

  // ===== Helpers de estudiantes =====
  private normalize(list: StudentName[]): StudentWithFullName[] {
    return (list ?? []).map((s) => ({
      ...s,
      fullName: (`${s.firstName ?? ''} ${s.lastName ?? ''}`).trim(),
    }));
  }

  /** Busca nombres. Si q=='' y viene vacío, reintenta con 'a' para poblar. */
  private fetchNames(q: string, onDone: (arr: StudentWithFullName[]) => void): void {
    this.studentSrv.getNames(q).subscribe({
      next: (list) => {
        let arr = this.normalize(list);
        if (arr.length === 0 && q === '') {
          this.studentSrv.getNames('a').subscribe({
            next: (list2) => onDone(this.normalize(list2)),
            error: () => onDone([]),
          });
        } else {
          onDone(arr);
        }
      },
      error: () => onDone([]),
    });
  }

  displayStudent(st?: StudentWithFullName | null): string {
    return st ? `${st.fullName} (ID ${st.id})` : '';
  }

  // Dropdowns
  showAllStudents(): void {
    this.studentsLoading = true;
    this.fetchNames('', (arr) => {
      this.suggestionsStudents = arr.slice(0, 50);
      this.allStudents = arr;
      this.studentsLoading = false;
    });
  }

  // Autocomplete typing
  completeStudents(e: { query: string }): void {
    this.studentsLoading = true;
    const q = (e?.query ?? '').trim();
    this.fetchNames(q, (arr) => {
      this.suggestionsStudents = arr;
      this.studentsLoading = false;
    });
  }

  // ===== Manejo de errores del backend =====

  /** Traduce fragmentos comunes a ES y mapea nombres de campos. */
  private translateMessage(raw: string): string {
    const fieldMap: Record<string, string> = {
      name: 'Nombre del proyecto',
      description: 'Descripción',
      budgetGoal: 'Meta de presupuesto',
      status: 'Estado',
      startDate: 'Fecha de inicio',
      estimatedEndDate: 'Fecha de finalización estimada',
      ownerId: 'Responsable',
      studentIds: 'Estudiantes',
    };

    let msg = raw.trim();

    // Reemplazos de frases típicas
    msg = msg
      .replace(/The date must be current or future\.?/gi, 'La fecha debe ser actual o futura.')
      .replace(/must not be blank/gi, 'no debe estar vacío')
      .replace(/must be a well-formed email address/gi, 'debe ser un email válido')
      .replace(/size must be between/gi, 'el tamaño debe estar entre')
      .replace(/must be greater than or equal to/gi, 'debe ser mayor o igual a')
      .replace(/must be less than or equal to/gi, 'debe ser menor o igual a');

    // Cambiar etiqueta del campo a español si viene en formato "field: mensaje"
    const m = msg.match(/^([^:]+):\s*(.+)$/);
    if (m) {
      const field = m[1].trim();
      const rest = m[2].trim();
      const nice = fieldMap[field] ?? field;
      return `${nice}: ${rest}`;
    }
    return msg;
  }

  /**
   * Extrae mensajes desde HttpErrorResponse (JSON o texto).
   * Además, si detecta "campo: mensaje", marca el control con error 'server'.
   */
  private handleServerValidation(err: unknown): string[] {
    if (!(err instanceof HttpErrorResponse)) return [];
    let payload: any = err.error;

    // Si viene como string, intento parsear a JSON; si falla, uso texto.
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { message: payload };
      }
    }

    // Intentar múltiples formatos
    let messages: string[] = [];
    if (Array.isArray(payload)) {
      messages = payload.map((x) => String(x?.message ?? x));
    } else if (payload?.errors && typeof payload.errors === 'object') {
      // e.g., { errors: { description: ["...","..."], estimatedEndDate: ["..."] } }
      for (const [field, arr] of Object.entries(payload.errors)) {
        const list = Array.isArray(arr) ? arr : [arr];
        for (const raw of list) {
          messages.push(`${field}: ${raw}`);
        }
      }
    } else if (payload?.message) {
      messages = String(payload.message)
        .split(/(?<=\.)\s+|;|\n/) // separa por punto+espacio, ; o newline
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // Traducir y bindear a controles si se puede
    const translated: string[] = [];
    for (const raw of messages) {
      const t = this.translateMessage(raw);

      // Si viene "campo: mensaje" marcar el control
      const mm = t.match(/^([^:]+):\s*(.+)$/);
      if (mm) {
        const spanishLabel = mm[1].trim();
        const onlyMsg = mm[2].trim();

        // Map inverso básico para detectar el control (si el backend manda el nombre técnico, este paso ya se hizo arriba)
        const controlBySpanish: Record<string, string> = {
          'Nombre del proyecto': 'name',
          'Descripción': 'description',
          'Meta de presupuesto': 'budgetGoal',
          'Estado': 'status',
          'Fecha de inicio': 'startDate',
          'Fecha de finalización estimada': 'estimatedEndDate',
          'Responsable': 'owner',
          'Estudiantes': 'students',
        };

        const ctlNameGuess =
          Object.entries(controlBySpanish).find(([k]) => k === spanishLabel)?.[1] ?? null;

        if (ctlNameGuess && this.projectForm.get(ctlNameGuess)) {
          this.projectForm.get(ctlNameGuess)?.setErrors({ server: onlyMsg });
          this.projectForm.get(ctlNameGuess)?.markAsTouched();
        }
      }

      translated.push(t);
    }

    return translated;
  }

  // ===== Acciones del form =====
  onCancel(): void {
    this.projectForm.reset();
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Por favor, revisa los campos marcados en rojo.' });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas crear este proyecto? Nuestra IA lo analizará y clasificará automáticamente.',
      header: 'Confirmar Creación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, crear',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.proceedWithCreation();
      }
    });
  }

  private proceedWithCreation(): void {

    const v = this.projectForm.getRawValue() as { // Usar getRawValue() para incluir controles deshabilitados
      name: string;
      description: string;
      budgetGoal: number | null;
      startDate: string;
      estimatedEndDate: string;
      owner: StudentWithFullName | null;
      students: StudentWithFullName[];
    };

    if (!v.owner) {
      this.msg.add({
        severity: 'error',
        summary: 'Error de usuario',
        detail: 'No se pudo determinar el líder del proyecto. Por favor, recargue la página.',
        life: 6000,
      });
      return;
    }

    const ownerId = (v.owner as StudentWithFullName).id;
    const studentIds = (v.students ?? []).map((s) => s.id);

    const dto: CreateProjectDto = {
      name: v.name,
      description: v.description,
      budgetGoal: Number(v.budgetGoal ?? 0),
      startDate: v.startDate,
      estimatedEndDate: v.estimatedEndDate,
      ownerId,
      studentIds,
    };

    // Feedback de progreso en UI
    this.creationState = 'creating';
    let messageIndex = 0;
    this.currentLoadingMessage = this.loadingMessages[messageIndex];
    const prog = setInterval(() => { // Simula el cambio de mensajes durante el proceso
      messageIndex = (messageIndex + 1) % this.loadingMessages.length;
      this.currentLoadingMessage = this.loadingMessages[messageIndex];
    }, 4000); // Cambia el mensaje cada 4 segundos

    // Esperar a que la API responda Y que pasen al menos 10 segundos
    // La respuesta de 'create' ya contiene el tagName, no necesitamos la segunda llamada.
    const createProject$ = this.projectsSrv.create(dto);

    const minTime$ = timer(10000);

    forkJoin([createProject$, minTime$]).subscribe({
      // Especificamos el tipo de la respuesta esperada del backend
      next: ([createdProject, _]) => { // Usamos directamente la respuesta de la creación
        clearInterval(prog);
        this.assignedTag = (createdProject as any).tagName || 'General'; // Corregido: leer 'tagName' de la respuesta de creación
        this.creationState = 'success';
      },
      error: (err: unknown) => {
        clearInterval(prog);
        this.creationState = 'idle';

        // --- INICIO: Manejo de error de cuota de API ---
        if (err instanceof HttpErrorResponse && err.status === 429) {
          this.msg.add({
            severity: 'warn',
            summary: 'Servicio de IA congestionado',
            detail: 'Nuestro asistente de IA está procesando muchas solicitudes. Por favor, espera un minuto y vuelve a intentarlo.',
            life: 8000,
          });
          console.error('Error 429: Cuota de la API de IA excedida.', err);
          return; // No continuar con el manejo de errores genérico
        }
        // --- FIN: Manejo de error de cuota de API ---

        const details = this.handleServerValidation(err); // Manejo de otros errores de validación
        if (details.length) {
          this.msg.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: details.join('\n'),
            life: 6000,
          });
        } else {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el proyecto.',
            life: 4000,
          });
        }
        console.error('Error al crear proyecto', err);
      },
    });
  }

  onContinue(): void {
    this.creationState = 'idle';
    this.router.navigate(['/misproyectos']);
  }
}
