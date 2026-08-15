import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { of } from 'rxjs';

import { RolesService, IRole, IPermission } from '../../../core/services/roles.service';
import { PermissionsService, IPermissionDTO } from '../../../core/services/permissions.service';

type PermissionLike = IPermission & Partial<{
  name: string;
  permission: string;
  permissionName: string;
  code: string;
  label: string;
}>;

@Component({
  standalone: true,
  selector: 'app-roles-management-page',
  imports: [
    CommonModule, FormsModule,
    ToolbarModule, ButtonModule, InputTextModule,
    TableModule, TagModule, ToastModule, ConfirmDialogModule,
    DialogModule, MultiSelectModule, DividerModule, CardModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-management-page.component.html'
})
export class RolesManagementPageComponent implements OnInit {
  private svc = inject(RolesService);
  private permsSvc = inject(PermissionsService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);

  roles = signal<IRole[]>([]);
  loading = signal(false);

  showDetail = signal(false);
  selected = signal<IRole | null>(null);

  showDialog = signal(false);
  isEdit = signal(false);

  formModel: IRole = { id: 0, role: '', permissionsList: [] };

  availablePermissions = signal<IPermissionDTO[]>([]);
  selectedPermissions: IPermissionDTO[] = [];

  ngOnInit(): void {
    this.reload();
    this.loadPermissions();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data: any[]) => {
        this.roles.set((data || []).map(r => ({
          ...r,
          permissionsList: r.permissionsList ?? r.permissions ?? []
        })));
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load roles' });
        console.error(err);
      }
    });
  }

  loadPermissions(): void {
    this.permsSvc.getAll().subscribe({
      next: (perms) => this.availablePermissions.set(perms || []),
      error: (err: any) => {
        console.error('Error loading permissions', err);
        this.availablePermissions.set([]);
      }
    });
  }

  permLabel(p: PermissionLike, index = 0): string {
    return (
      p?.permissionName ??
      p?.label ??
      p?.name ??
      p?.permission ??
      (p as any)?.displayName ??
      (p as any)?.code ??
      `Permission ${p?.id ?? index}`
    ) as string;
  }

  displayPerm(p: any, index = 0): string {
    return this.permLabel(p as PermissionLike, index);
  }

  onView(row: IRole) {
    this.selected.set(row);
    this.showDetail.set(true);
  }

  openNew(): void {
    this.isEdit.set(false);
    this.formModel = { id: 0, role: '', permissionsList: [] };
    this.selectedPermissions = [];
    this.showDialog.set(true);
  }

  edit(row: IRole): void {
    this.isEdit.set(true);
    this.formModel = { ...row };

    const setSelection = () => {
      const ids = new Set((row.permissionsList || []).map((p: any) => p.id));
      this.selectedPermissions = this.availablePermissions().filter(ap => ids.has(ap.id));
    };

    if (this.availablePermissions().length > 0) {
      setSelection();
    } else {
      this.permsSvc.getAll().subscribe({
        next: (perms) => { 
          this.availablePermissions.set(perms || []); 
          setSelection(); 
        },
        error: () => this.availablePermissions.set([])
      });
    }

    this.showDialog.set(true);
  }

  save(form?: NgForm): void {
    if (form && form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Complete required fields.' });
      return;
    }

    const editMode = this.isEdit() && !!this.formModel.id;
    const permsPayload = (this.selectedPermissions || []).map(p => ({ id: p.id }));

    if (!editMode) {
      const payloadCreate: any = {
        role: this.formModel.role,
        permissionsList: permsPayload
      };

      this.loading.set(true);
      const apiCreate = (this.svc as any).create || (this.svc as any).save || (this.svc as any).add || (this.svc as any).post;
      const obs = typeof apiCreate === 'function' ? apiCreate.call(this.svc, payloadCreate) : of(null);

      obs.subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Role', detail: 'Created successfully' });
          this.showDialog.set(false);
          this.reload();
        },
        error: (err: any) => {
          console.error(err);
          this.toast.add({ severity: 'error', summary: 'Role', detail: 'Failed to create' });
        },
        complete: () => this.loading.set(false)
      });
      return;
    }

    const payloadUpdate: any = {
      id: this.formModel.id,
      role: this.formModel.role,
      permissionsList: permsPayload
    };

    this.loading.set(true);
    const apiUpdate = (this.svc as any).update || (this.svc as any).put || (this.svc as any).patch || (this.svc as any).save;
    const obs = typeof apiUpdate === 'function' ? apiUpdate.call(this.svc, payloadUpdate) : of(null);

    obs.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Role', detail: 'Updated successfully' });
        this.showDialog.set(false);
        this.reload();
      },
      error: (err: any) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Role', detail: 'Failed to update' });
      },
      complete: () => this.loading.set(false)
    });
  }

  del(row: IRole): void {
    this.confirm.confirm({
      message: `Delete role "${row.role}"?`,
      accept: () => {
        // Assume mock if delete is not implemented yet
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: row.role });
      }
    });
  }

  onDialogHide(): void {
    this.showDialog.set(false);
  }

  private readonly tagPalette = [
    { bg: '#22c55e', fg: '#ffffff' }, // green-500
    { bg: '#3b82f6', fg: '#ffffff' }, // blue-500
    { bg: '#f59e0b', fg: '#111111' }, // amber-500
    { bg: '#ef4444', fg: '#ffffff' }, // red-500
    { bg: '#a855f7', fg: '#ffffff' }, // purple-500
    { bg: '#14b8a6', fg: '#ffffff' }, // teal-500
    { bg: '#06b6d4', fg: '#111111' }  // cyan-500
  ];

  private hashKey(str: string): number {
    let h = 0;
    for (let i = 0; i < (str || '').length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  tagStyle(p: any, index: number) {
    const key = this.permLabel(p as PermissionLike, index);
    const h = this.hashKey(key);
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
}
