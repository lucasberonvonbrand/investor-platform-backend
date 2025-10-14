import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProjectsMasterService } from '../../../core/services/projects-master.service';
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
    ButtonModule, DialogModule, InputTextModule, InputNumberModule,
    DatePickerModule, AccordionModule, ToastModule,
  ],
  providers: [MessageService],
})
export class ProyectosMaestroComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private svc = inject(ProjectsMasterService);
  private toast = inject(MessageService);

  projectId = signal<number>(0);
  project = signal<IMyProject | null>(null);

  currentUser = this.getCurrentUser();
  get isInvestor(): boolean { return (this.currentUser?.role || '').toLowerCase() === 'inversor'; }

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
        const investorId = this.currentUser?.id;
        this.contracts.set(
          (list || []).filter((c: IContract & { investorId?: number }) =>
            c.investorId ? c.investorId === investorId : true
          )
        );
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
    if (!this.isInvestor) return;
    this.editing = null;
    this.contractForm.reset({
      title: '',
      amount: 0,
      startDate: null,
      endDate: null,
    });
    this.accordionOpen.set(true);
  }

  editContract(row: IContract): void {
    if (!this.isInvestor) return;
    this.editing = row;
    this.contractForm.reset({
      title: row.title,
      amount: row.amount,
      startDate: row.startDate ? new Date(row.startDate) : null,
      endDate: row.endDate ? new Date(row.endDate) : null,
    });
    this.accordionOpen.set(true);
  }

  cancelEdit(): void {
    this.accordionOpen.set(false);
    this.editing = null;
  }

  saveContract(): void {
    if (this.contractForm.invalid || !this.isInvestor) return;

    const raw = this.contractForm.getRawValue();
    const dto: Partial<IContract> & { projectId: number } = {
      projectId: this.projectId(),
      title: raw.title,
      amount: raw.amount,
      startDate: raw.startDate ? this.formatISO(raw.startDate) : null,
      endDate: raw.endDate ? this.formatISO(raw.endDate) : null,
      status: this.editing ? this.editing.status : 'borrador',
      // investorId: this.currentUser?.id, // lo sumamos cuando pases los EP
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

  private getCurrentUser(): { id: number; role: string; email?: string; name?: string } | null {
    try {
      const raw = localStorage.getItem('pp_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  tagStyle(text: string, i = 0) {
    const palette = ['#e0f2fe', '#dcfce7', '#fee2e2', '#fef9c3', '#ede9fe'];
    const idx = Math.abs((text || '').length + i) % palette.length;
    return { background: palette[idx], color: '#111827', borderRadius: '9999px', padding: '0 8px', 'font-weight': 600 };
  }
}
