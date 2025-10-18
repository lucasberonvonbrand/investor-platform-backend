import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';            // (lo podés quitar si ya no usás el modal)
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProjectsMasterService } from '../../../core/services/projects-master.service';
import { AuthService } from '../../auth/login/auth.service';
import type { IMyProject, IContract } from '../../../core/services/projects-master.service';

type Student = { id: number; name: string; email?: string };

@Component({
  standalone: true,
  selector: 'app-proyectos-maestro',
  templateUrl: './proyectos-maestro.component.html',
  styleUrls: ['./proyectos-maestro.component.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ToolbarModule, CardModule, TagModule, TableModule,
    ButtonModule, DialogModule, InputTextModule, InputNumberModule, EditorModule, ConfirmDialogModule,
    DatePickerModule, AccordionModule, ToastModule
  ],
  animations: [
    trigger('slide', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden', 'margin-top': '0' })),
      transition(':enter', [animate('400ms ease-in-out', style({ height: '*', opacity: 1, 'margin-top': '1rem' }))]),
      transition(':leave', [animate('400ms ease-in-out', style({ height: '0px', opacity: 0, 'margin-top': '0' }))]),
    ])
  ],
  providers: [MessageService, ConfirmationService],
})
export class ProyectosMaestroComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private svc = inject(ProjectsMasterService);
  private toast = inject(MessageService);
  private auth = inject(AuthService);
  private confirmSvc = inject(ConfirmationService);

  projectId = signal<number>(0);
  project = signal<IMyProject | null>(null);

  // --- Lógica de Roles ---
  private currentUser = this.auth.getSession();
  isInvestor = computed(() => this.currentUser?.roles.includes('ROLE_INVESTOR') ?? false);
  isOwner = computed(() => {
    return this.project()?.ownerId === this.currentUser?.id;
  });

  get team(): Student[] {
    const p = this.project();
    return (p?.students as unknown as Student[]) ?? [];
  }

  contracts = signal<IContract[]>([]);
  loading = signal<boolean>(false);

  // ===== Acordeón Crear/Editar contrato =====
  accordionOpen = signal<boolean>(false);
  editing: IContract | null = null;
  contractForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    startDate: [null as Date | null],
    profit1Year: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit2Years: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit3Years: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
    clauses: [''], // Campo para el editor de texto
    endDate: [null as Date | null],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.toast.add({ severity: 'warn', summary: 'Proyecto', detail: 'ID inválido', life: 2200 });
      return;
    }
    this.projectId.set(id);
    this.loadProject();
    this.loadContracts();
  }

  goBack(): void {
    window.history.back();
  }

  private loadProject(): void {
    this.loading.set(true);
    this.svc.getProjectById(this.projectId()).subscribe({
      next: (p: IMyProject | null) => this.project.set(p || null),
      error: () => this.toast.add({ severity: 'error', summary: 'Proyecto', detail: 'No se pudo cargar' }),
      complete: () => this.loading.set(false),
    });
  }

  private loadContracts(): void {
    this.svc.getContracts(this.projectId()).subscribe({
      next: (list: IContract[]) => {
        this.contracts.set(list || []);
      }
    });
  }

  contactStudent(): void {
    const studentWithEmail = this.team.find(s => !!s.email);
    const email = studentWithEmail?.email;
    const p = this.project();
    if (!email || !p) {
      this.toast.add({ severity: 'info', summary: 'Contacto', detail: 'No hay email de estudiante disponible' });
      return;
    }
    const subject = encodeURIComponent(`Consulta sobre el proyecto: ${p.title ?? ''}`);
    const body = encodeURIComponent('Hola, ¿podemos coordinar para revisar los avances?');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  // ===== Crear / Editar contrato (Acordeón) =====
  openCreateContract(): void {
    if (!this.isInvestor()) return;
    this.editing = null;
    this.contractForm.reset({
      title: '',
      amount: 0,
      startDate: null,
      endDate: null,
      clauses: '',
    });
    this.accordionOpen.set(true);
  }

  editContract(row: IContract): void {
    if (!this.isInvestor()) return;
    this.editing = row;
    this.contractForm.reset({
      title: row.title,
      amount: row.amount,
      startDate: row.startDate ? new Date(row.startDate) : null,
      endDate: row.endDate ? new Date(row.endDate) : null,
      clauses: (row as any).clauses ?? '', // Cargar cláusulas si existen
    });
    this.accordionOpen.set(true);
  }

  cancelEdit(): void {
    this.accordionOpen.set(false);
    this.editing = null;
  }

  saveContract(): void {
    if (this.contractForm.invalid || !this.isInvestor()) return;

    const raw = this.contractForm.getRawValue();
    const dto: Partial<IContract> & { projectId: number } = {
      projectId: this.projectId(),
      title: raw.title,
      amount: raw.amount,
      currency: 'USD', // Volvemos a fijar USD
      profit1Year: raw.profit1Year,
      profit2Years: raw.profit2Years,
      profit3Years: raw.profit3Years,
      startDate: raw.startDate ? this.formatISO(raw.startDate) : null,
      endDate: raw.endDate ? this.formatISO(raw.endDate) : null,
      clauses: raw.clauses,
      status: this.editing ? this.editing.status : 'PENDING_STUDENT_SIGNATURE',
      createdByInvestorId: this.currentUser?.id,
      id: this.editing?.id,
    } as any;

    this.svc.upsertContract(dto).subscribe({
      next: (saved: IContract) => {
        const list = this.contracts();
        const idx = list.findIndex(c => c.id === saved.id);
        if (idx >= 0) {
          list[idx] = saved;
        } else {
          list.unshift(saved);
        }
        this.contracts.set([...list]);
        this.toast.add({ severity: 'success', summary: 'Contrato', detail: this.editing ? 'Actualizado' : 'Creado', life: 1600 });
        this.cancelEdit();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Contrato', detail: 'No se pudo guardar' }),
    });
  }

  private formatISO(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  // ===== Acciones de Contrato (Firma y Cancelación) =====

  signContract(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres firmar y aceptar los términos del contrato "${contract.title}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Firma de Contrato',
      icon: 'pi pi-file-edit',
      acceptLabel: 'Sí, firmar',
      rejectLabel: 'No',
      accept: () => {
        const studentId = this.currentUser?.id;
        if (!studentId) {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al usuario.' });
          return;
        }
        this.svc.signContract(contract.id, studentId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato firmado correctamente.' });
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo firmar el contrato.' })
        });
      }
    });
  }

  cancelContractByInvestor(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres retirar la oferta del contrato "${contract.title}"?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, retirar oferta',
      rejectLabel: 'No',
      accept: () => {
        const investorId = this.currentUser?.id;
        if (!investorId) {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al usuario.' });
          return;
        }
        this.svc.cancelContractByInvestor(contract.id, investorId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'info', summary: 'Cancelado', detail: 'La oferta de contrato ha sido retirada.' });
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo cancelar la oferta.' })
        });
      }
    });
  }

  private updateContractInList(updated: IContract): void {
    this.contracts.update(list =>
      list.map(c => c.id === updated.id ? updated : c)
    );
  }

  tagStyle(text: string, i = 0) {
    const palette = ['#e0f2fe', '#dcfce7', '#fee2e2', '#fef9c3', '#ede9fe'];
    const idx = Math.abs((text || '').length + i) % palette.length;
    return { background: palette[idx], color: '#111827', borderRadius: '9999px', padding: '0 8px', 'font-weight': 600 };
  }
}
