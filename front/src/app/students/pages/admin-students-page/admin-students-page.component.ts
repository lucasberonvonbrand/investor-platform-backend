import { Component, OnInit, inject, signal } from '@angular/core';
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
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StudentsService, IStudent, Province, University, DegreeStatus, IAddress } from '../../services/students.service';

@Component({
  selector: 'app-admin-students-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TableModule, TagModule, ToastModule, ConfirmDialogModule, SelectButtonModule,
    DialogModule, PasswordModule, CheckboxModule, DividerModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-students-page.component.html'
})
export class AdminStudentsPageComponent implements OnInit {
  private svc = inject(StudentsService);
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);

  allStudents = signal<IStudent[]>([]);
  filteredStudents = signal<IStudent[]>([]);
  
  filterStatusOptions = [
    { label: 'Enabled', value: 'enabled' }, 
    { label: 'Disabled', value: 'disabled' }, 
    { label: 'All', value: 'all' }
  ];
  currentFilter = signal<'enabled' | 'disabled' | 'all'>('enabled');
  loading = signal(false);

  showDetail = signal(false);
  selected = signal<IStudent | null>(null);

  showDialog = signal(false);
  isEdit = signal(false);

  formModel: IStudent = this.emptyForm();

  universities = Object.values(University).map(uni => ({ label: uni.replace(/_/g, ' '), value: uni }));
  degreeStatuses = [
    { label: 'In Progress', value: DegreeStatus.IN_PROGRESS },
    { label: 'Completed', value: DegreeStatus.COMPLETED },
    { label: 'Suspended', value: DegreeStatus.SUSPENDED },
    { label: 'Abandoned', value: DegreeStatus.ABANDONED }
  ];

  ngOnInit(): void {
    this.reload();
  }

  private defaultAddress(): IAddress {
    return { street: '', number: 0, city: '', province: Province.BUENOS_AIRES, postalCode: 0 };
  }

  private emptyForm(): IStudent {
    return {
      id: 0,
      username: '',
      email: '',
      password: '',
      enabled: true,
      accountNotExpired: true,
      accountNotLocked: true,
      credentialNotExpired: true,
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      dateOfBirth: '',
      university: University.UBA,
      career: '',
      degreeStatus: DegreeStatus.IN_PROGRESS,
      address: this.defaultAddress(),
    };
  }

  private normalize(dto: any): IStudent {
    return {
      id: dto?.id ?? 0,
      username: dto?.username ?? '',
      email: dto?.email ?? '',
      enabled: dto?.enabled ?? true,
      accountNotExpired: dto?.accountNotExpired ?? true,
      accountNotLocked: dto?.accountNotLocked ?? true,
      credentialNotExpired: dto?.credentialNotExpired ?? true,
      firstName: dto?.firstName ?? '',
      lastName: dto?.lastName ?? '',
      dni: dto?.dni ?? '',
      phone: dto?.phone ?? '',
      dateOfBirth: dto?.dateOfBirth ?? '',
      university: dto?.university ?? University.UBA,
      career: dto?.career ?? '',
      degreeStatus: dto?.degreeStatus ?? DegreeStatus.IN_PROGRESS,
      address: dto?.address ?? this.defaultAddress(),
      password: ''
    };
  }

  reload(): void {
    this.loading.set(true);
    this.svc.loadAll().subscribe({
      next: (data) => {
        const normalized = (data || []).map(d => this.normalize(d));
        this.allStudents.set(normalized);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load students' });
      }
    });
  }

  applyFilter(): void {
    const filter = this.currentFilter();
    if (filter === 'all') {
      this.filteredStudents.set([...this.allStudents()]);
    } else {
      const isEnabled = filter === 'enabled';
      this.filteredStudents.set(this.allStudents().filter(i => i.enabled === isEnabled));
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  onView(row: IStudent) { 
    this.selected.set(row); 
    this.showDetail.set(true); 
  }

  openNew(): void {
    this.isEdit.set(false);
    this.formModel = this.emptyForm();
    this.showDialog.set(true);
  }

  edit(row: IStudent): void {
    this.isEdit.set(true);
    this.formModel = {
      ...row,
      password: '',
      address: row.address ?? this.defaultAddress(),
    };
    this.showDialog.set(true);
  }

  save(form?: NgForm): void {
    if (form && form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please complete all required fields.' });
      return;
    }

    const editMode = this.isEdit() && !!this.formModel.id;

    if (!editMode) {
      const payload: any = {
        username: this.formModel.username,
        email: this.formModel.email,
        password: this.formModel.password,
        enabled: this.formModel.enabled,
        accountNotExpired: this.formModel.accountNotExpired,
        accountNotLocked: this.formModel.accountNotLocked,
        credentialNotExpired: this.formModel.credentialNotExpired,
        firstName: this.formModel.firstName,
        lastName: this.formModel.lastName,
        dni: this.formModel.dni,
        phone: this.formModel.phone,
        dateOfBirth: this.formModel.dateOfBirth,
        university: this.formModel.university,
        career: this.formModel.career,
        degreeStatus: this.formModel.degreeStatus,
        address: this.formModel.address
      };

      this.loading.set(true);
      this.svc.create(payload).subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Success', detail: 'Student created' });
          this.showDialog.set(false);
          this.reload();
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not create student' });
        }
      });
      return;
    }

    this.loading.set(true);
    const payload: any = {
      ...this.formModel,
      password: (this.formModel.password && this.formModel.password.trim() !== '') ? this.formModel.password : undefined
    };
    delete payload.id;

    this.svc.updateByAdmin(this.formModel.id!, payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Success', detail: 'Student updated' });
        this.showDialog.set(false);
        this.reload();
      },
      error: (err: any) => {
        const detail = err?.error?.message || 'Could not update student';
        console.error('Error updating student by admin:', err);
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  toggleActive(row: IStudent, enable: boolean): void {
    this.confirm.confirm({
      message: `${enable ? 'Activate' : 'Deactivate'} ${row.username}?`,
      accept: () => {
        if (row.id === undefined) {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Student ID not found.' });
          return;
        }
        
        const obs = enable ? this.svc.activate(row.id) : this.svc.deactivate(row.id);
        obs.subscribe({
          next: () => {
            this.toast.add({ severity: enable ? 'success' : 'warn', summary: 'Success', detail: enable ? 'Activated' : 'Deactivated' });
            this.reload();
          },
          error: () => {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
          }
        });
      }
    });
  }

  onDialogHide(): void { 
    this.showDialog.set(false); 
  }
}
