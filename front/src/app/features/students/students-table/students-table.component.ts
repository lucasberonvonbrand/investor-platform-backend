// src/app/features/estudiantes/estudiantes.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HttpClient } from '@angular/common/http';

// 👇 Path corregido: desde features/estudiantes a core/services es ../../
import { StudentService } from '../../../core/services/students.service';
import { RolesService, IRole } from '../../../core/services/roles.service';
import { DegreeStatus } from '../../../models/student.model';
import { StudentFormComponent } from '../students-form/students-form.component';

interface IStudentView {
  id: number;
  username: string;
  email: string;

  enabled: boolean;
  accountNotExpired: boolean;
  accountNotLocked: boolean;
  credentialNotExpired: boolean;

  rolesList: IRole[];

  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dni?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  university?: string | null;
  career?: string | null;
  degreeStatus?: string | null;
  linkedinUrl?: string | null;
  description?: string | null;
  address?: {
    street: string;
    number: number;
    city: string;
    province: string;
    postalCode: number;
  } | null;

  password?: string;
}

@Component({
  standalone: true,
  selector: 'app-estudiantes',
  imports: [
    CommonModule, FormsModule, StudentFormComponent,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TableModule, TagModule, ToastModule, ConfirmDialogModule, SelectButtonModule,
    DialogModule, PasswordModule, CheckboxModule, MultiSelectModule, DividerModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './students-table.component.html',   // 👈 corregido
  styleUrls: ['./students-table.component.scss']    // 👈 corregido
})
export class EstudiantesComponent implements OnInit {
  private studentsSvc = inject(StudentService);
  private rolesSvc = inject(RolesService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private http = inject(HttpClient);

  // Relativo para pasar por el proxy
  private apiUrl = '/api/students';

  // --- Estado del componente ---
  allStudents: IStudentView[] = []; // Lista completa sin filtrar
  filteredStudents: IStudentView[] = []; // Lista que se muestra en la tabla
  filterStatusOptions = [
    { label: 'Habilitados', value: 'enabled' }, { label: 'Deshabilitados', value: 'disabled' }, { label: 'Todos', value: 'all' }
  ];
  currentFilter: 'enabled' | 'disabled' | 'all' = 'enabled';
  loading = false;

  showDetail = false;
  selected: IStudentView | null = null;

  showDialog = false;
  isEdit = false;

  formModel: IStudentView = this.emptyForm();
  availableRoles: IRole[] = [];
  selectedRoles: IRole[] = [];
  degreeStatusOptions = [
    { label: 'En curso', value: DegreeStatus.IN_PROGRESS },
    { label: 'Completado', value: DegreeStatus.COMPLETED },
    { label: 'Suspendido', value: DegreeStatus.SUSPENDED },
    { label: 'Abandonado', value: DegreeStatus.ABANDONED }
  ];

  ngOnInit(): void {
    this.reload();
    this.loadRoles();
  }

  private emptyForm(): IStudentView {
    return {
      id: 0,
      username: '',
      email: '',
      enabled: true,
      accountNotExpired: true,
      accountNotLocked: true,
      credentialNotExpired: true,
      rolesList: [],
      password: ''
    };
  }

  private normalize(dto: any): IStudentView {
    return {
      id: dto?.id ?? 0,
      username: dto?.username ?? '',
      email: dto?.email ?? '',
      enabled: dto?.enabled ?? true,
      accountNotExpired: dto?.accountNotExpired ?? true,
      accountNotLocked: dto?.accountNotLocked ?? true,
      credentialNotExpired: dto?.credentialNotExpired ?? true,
      rolesList: Array.isArray(dto?.roles)
        ? dto.roles.map((r: any) => ({ id: r?.id ?? 0, role: r?.role ?? '' }))
        : [],
      photoUrl: dto?.photoUrl ?? null,
      firstName: dto?.firstName ?? null,
      lastName: dto?.lastName ?? null,
      dni: dto?.dni ?? null,
      phone: dto?.phone ?? null,
      dateOfBirth: dto?.dateOfBirth ?? null,
      university: dto?.university ?? null,
      career: dto?.career ?? null,
      degreeStatus: dto?.degreeStatus ?? null,
      linkedinUrl: dto?.linkedinUrl ?? null,
      description: dto?.description ?? null,
      address: dto?.address ?? null,
      password: ''
    };
  }

  loadRoles(): void {
    this.rolesSvc.getAll().subscribe({
      next: (roles) => this.availableRoles = roles || [],
      error: () => this.toast.add({ severity: 'warn', summary: 'Roles', detail: 'No se pudieron cargar los roles' })
    });
  }

  reload(): void {
    this.loading = true;
    this.studentsSvc.loadAll().subscribe({
      next: (data) => {
        this.allStudents = (data || []).map(d => this.normalize(d));
        this.loading = false;
        this.applyFilter(); // Aplicar el filtro inicial
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Estudiantes', detail: 'No se pudieron cargar' });
      }
    });
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredStudents = [...this.allStudents];
    } else {
      const isEnabled = this.currentFilter === 'enabled';
      this.filteredStudents = this.allStudents.filter(s => s.enabled === isEnabled);
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  handleUserCreation(): void {
    this.showDialog = false;
    this.reload();
  }

  onView(row: IStudentView) { this.selected = row; this.showDetail = true; }

  openNew(): void {
    this.isEdit = false;
    this.formModel = this.emptyForm();
    this.selectedRoles = [];
    this.showDialog = true;
  }

  edit(row: IStudentView): void {
    this.isEdit = true;
    this.formModel = { ...row, password: '' };
    this.selectedRoles = this.availableRoles.filter(ar => row.rolesList?.some(r => r.id === ar.id));
    this.showDialog = true;
  }

  save(form?: NgForm): void {
    if (form && form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      this.toast.add({ severity: 'warn', summary: 'Validación', detail: 'Completá los campos obligatorios.' });
      return;
    }

    const rolesById = (this.selectedRoles || []).map(r => ({ id: r.id }));

    if (!this.isEdit) {
      const payload: any = {
        username: this.formModel.username,
        email: this.formModel.email,
        password: this.formModel.password,
        enabled: this.formModel.enabled,
        accountNotExpired: this.formModel.accountNotExpired,
        accountNotLocked: this.formModel.accountNotLocked,
        credentialNotExpired: this.formModel.credentialNotExpired,
        roles: rolesById
      };

      this.loading = true;
      this.studentsSvc.create(payload).subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Estudiante', detail: 'Creado' });
          this.showDialog = false;
          this.reload();
        },
        error: (err) => {
          console.error(err);
          this.toast.add({ severity: 'error', summary: 'Estudiante', detail: 'No se pudo crear' });
        },
        complete: () => (this.loading = false)
      });
      return;
    }

    const body: any = {
      username: this.formModel.username,
      email: this.formModel.email,
      enabled: this.formModel.enabled,
      accountNotExpired: this.formModel.accountNotExpired,
      accountNotLocked: this.formModel.accountNotLocked,
      credentialNotExpired: this.formModel.credentialNotExpired,
      roles: rolesById
    };
    if (this.formModel.password && this.formModel.password.trim() !== '') {
      body.password = this.formModel.password;
    }

    this.loading = true;
    this.http.patch(`${this.apiUrl}/${this.formModel.id}`, body).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Estudiante', detail: 'Actualizado' });
        this.showDialog = false;
        this.reload();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Estudiante', detail: 'No se pudo actualizar' });
      },
      complete: () => (this.loading = false)
    });
  }

  toggleActive(row: IStudentView, enable: boolean): void {
    this.confirm.confirm({
      message: `${enable ? '¿Activar' : '¿Desactivar'} ${row.username}?`,
      accept: () => {
        const obs = enable ? this.studentsSvc.activate(row.id) : this.studentsSvc.deactivate(row.id);
        obs.subscribe({
          next: () => {
            this.toast.add({
              severity: enable ? 'success' : 'warn',
              summary: 'Estudiante',
              detail: enable ? 'Activado' : 'Desactivado'
            });
            this.reload();
          },
          error: (err) => {
            console.error(err);
            this.toast.add({ severity: 'error', summary: 'Estudiante', detail: 'Operación fallida' });
          }
        });
      }
    });
  }

  onDialogHide(): void { this.showDialog = false; }

  private readonly tagPalette: Array<{bg: string; fg: string}> = [
    { bg: '#22c55e', fg: '#ffffff' },
    { bg: '#3b82f6', fg: '#ffffff' },
    { bg: '#f59e0b', fg: '#111111' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#a855f7', fg: '#ffffff' },
    { bg: '#14b8a6', fg: '#ffffff' },
    { bg: '#06b6d4', fg: '#111111' },
  ];

  private hashRole(name: string): number {
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h;
  }

  tagStyle(r: IRole, index: number) {
    const key = r?.role ?? String(index);
    const h = this.hashRole(key);
    const c = this.tagPalette[h % this.tagPalette.length];
    return {
      'background-color': c.bg,
      'color': c.fg,
      'border-color': 'transparent',
      'border-radius': '8px',
      'font-weight': 700,
      'padding': '0 .5rem'
    };
  }

  getDegreeStatusLabel(statusValue: string | null | undefined): string {
    const status = this.degreeStatusOptions.find(s => s.value === statusValue);
    return status ? status.label : (statusValue || '—');
  }
}
