import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs'; // Necesario para tipar la nueva función loadContracts

import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ProjectsMasterService, ContactOwnerDTO } from '../../../core/services/projects-master.service'; 
import { AuthService } from '../../auth/login/auth.service';
import type { IMyProject, IContract } from '../../../core/services/projects-master.service';

type Student = { id: number; name: string; email?: string };

@Component({
  standalone: true,
  selector: 'app-proyectos-invertidos-maestro',
  templateUrl: './proyectos-invertidos-maestro.component.html',
  styleUrls: ['./proyectos-invertidos-maestro.component.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ToolbarModule, CardModule, TagModule, TableModule,
    ButtonModule, DialogModule, InputTextModule, InputNumberModule, EditorModule, ConfirmDialogModule, SliderModule, TooltipModule, ProgressBarModule, RouterLink,
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
export class ProyectosInvertidosMaestroComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private svc = inject(ProjectsMasterService); // Usamos el servicio existente por ahora
  private toast = inject(MessageService);
  private auth = inject(AuthService);
  private confirmSvc = inject(ConfirmationService);

  projectId = signal<number>(0);
  investorId = signal<number>(0); // Nuevo ID necesario
  project = signal<IMyProject | null>(null);

  // --- Lógica de Roles ---
  private currentUser = this.auth.getSession();
  isInvestor = computed(() => this.currentUser?.roles.includes('ROLE_INVESTOR') ?? false);
  // En este componente, el usuario es el inversor y no el dueño del proyecto.
  isOwner = computed(() => {
    return this.project()?.ownerId === this.currentUser?.id;
  });


  get team(): Student[] {
    const p = this.project();
    return (p?.students as unknown as Student[]) ?? [];
  }

  fundingProgress = computed(() => {
    const p = this.project();
    if (!p || !p.fundingGoal || p.fundingGoal <= 0 || !p.fundingRaised) {
      return 0;
    }
    return Math.min(100, (p.fundingRaised / p.fundingGoal) * 100);
  });

  contracts = signal<IContract[]>([]);
  loading = signal<boolean>(false);

  // Las siguientes propiedades de UI/Formulario se mantienen
  // ya que el front-end solo cambiará la fuente de datos.

  // ===== Acordeón Crear/Editar contrato =====
  accordionOpen = signal<boolean>(false);
  editing: IContract | null = null;
  viewingOnly = signal<IContract | null>(null);

  currentContractStatus = computed<IContract['status'] | 'PENDING_STUDENT_SIGNATURE'>(() => {
    const contractInView = this.viewingOnly() || this.reviewingToSign || this.editing;
    return contractInView?.status || 'PENDING_STUDENT_SIGNATURE';
  });
  currentContractStatusLabel = computed(() => this.getContractStatusLabel(this.currentContractStatus()));

  reviewingToSign: IContract | null = null;
  currencyOptions = [
    { label: 'Dólar Estadounidense', value: 'USD' },
    { label: 'Peso Argentino', value: 'ARS' },
    { label: 'Euro', value: 'EUR' },
    { label: 'Yuan Chino', value: 'CNY' }
  ];
  contractForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    currency: ['USD', Validators.required],
    profit1Year: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit2Years: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit3Years: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
    clauses: [''],
  });

  ngOnInit(): void {
    // --- MODIFICACIÓN CLAVE DE RUTAS ---
    // Necesitas ambos IDs: Project ID y Investor ID.
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    const investorId = this.currentUser?.id; // Asume que el usuario logueado es el inversor

    console.log('Cargando detalles del proyecto invertido para Project ID:', projectId, 'y Investor ID:', investorId);

    if (!projectId || !investorId) {
      this.toast.add({ severity: 'error', summary: 'Error de Ruta', detail: 'Faltan IDs de Proyecto o Inversor.', life: 3000 });
      return;
    }
    
    this.projectId.set(projectId);
    this.investorId.set(investorId);
    this.loadProject();
    this.loadContracts();
  }

  goBack(): void {
    window.history.back();
  }

  private loadProject(): void {
    this.loading.set(true);
    // La carga del proyecto no cambia
    this.svc.getProjectById(this.projectId()).subscribe({
      next: (p: IMyProject | null) => this.project.set(p || null),
      error: () => this.toast.add({ severity: 'error', summary: 'Proyecto', detail: 'No se pudo cargar' }),
      complete: () => this.loading.set(false),
    });
  }

  // --- FUNCIÓN DE CARGA DE CONTRATOS MODIFICADA ---
  private loadContracts(): void {
    // Aquí es donde necesitas reemplazar la llamada.
    // **ASUMIMOS** que has añadido el nuevo método al ProjectsMasterService.
    this.svc.getContractsByInvestorAndProject(this.investorId(), this.projectId()).subscribe({
      next: (list: IContract[]) => {
        this.contracts.set(list || []);
      }
    });
  }

  openCreateContract(): void {
    if (!this.isInvestor()) return;
    this.editing = null;
    this.contractForm.reset({
      title: '',
      amount: 0,
      currency: 'USD',
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
      currency: row.currency ?? 'USD',
      clauses: (row as any).clauses ?? '',
    });
    this.accordionOpen.set(true);
  }

  cancelEdit(): void {
    this.accordionOpen.set(false);
    this.editing = null;
    this.reviewingToSign = null;
    this.viewingOnly.set(null);
    this.contractForm.enable();
  }

  saveContract(): void {
    if (this.reviewingToSign) {
      this.confirmAndSign(this.reviewingToSign);
      return;
    }

    if (this.contractForm.invalid || !this.isInvestor()) return;

    let dto: Partial<IContract> & { projectId: number };
    const raw = this.contractForm.getRawValue();

    if (this.editing) {
      // Payload para ACTUALIZAR
      dto = { // @ts-ignore
        idContract: this.editing.idContract,
        projectId: this.projectId(),
        title: raw.title,
        amount: raw.amount,
        currency: raw.currency as IContract['currency'],
        profit1Year: raw.profit1Year,
        profit2Years: raw.profit2Years,
        profit3Years: raw.profit3Years,
        clauses: raw.clauses,
        status: this.editing.status,
        createdByInvestorId: this.currentUser?.id,
      };
    } else {
      // Payload para CREAR
      dto = {
        projectId: this.projectId(),
        createdByInvestorId: this.currentUser?.id,
        textTitle: raw.title,
        amount: raw.amount,
        currency: raw.currency as IContract['currency'],
        profit1Year: raw.profit1Year,
        profit2Years: raw.profit2Years,
        profit3Years: raw.profit3Years,
        clauses: raw.clauses,
      };
    }
    
    this.svc.upsertContract(dto).subscribe({
      next: (saved: IContract) => {
        const list = this.contracts();
        const idx = list.findIndex(c => c.idContract === saved.idContract);
        if (idx >= 0) {
          list[idx] = saved;
        } else {
          list.unshift(saved);
        }
        this.contracts.set([...list]);
        this.toast.add({ severity: 'success', summary: 'Contrato', detail: this.editing ? 'Actualizado' : 'Creado', life: 1600 });
        this.cancelEdit();
      },
      error: (err: any) => {
        const detail = err?.error?.message || 'No se pudo guardar el contrato.';
        this.toast.add({ severity: 'error', summary: 'Error al guardar', detail: detail, life: 5000 });
      }
    });
  }

  private formatISO(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  calculateProfit(baseAmount: number | null | undefined, percentage: number | null | undefined): number {
    if (baseAmount == null || percentage == null) {
      return 0;
    }
    return (baseAmount * percentage) / 100;
  }

  // ===== Lógica de Contacto al Dueño del Proyecto (COPIADA DE proyectos-maestro) =====
  contactDialogVisible = signal(false);
  contactForm = this.fb.group({
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  openContactDialog(): void {
    this.contactForm.reset();
    this.contactDialogVisible.set(true);
  }

  sendContactEmail(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const session = this.auth.getSession();
    const projectId = this.projectId();

    if (!session || !session.email) {
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo identificar tu email. Por favor, inicia sesión de nuevo.'
      });
      return;
    }

    const contactData: ContactOwnerDTO = {
      fromEmail: session.email,
      fromName: session.username,
      subject: this.contactForm.value.subject!,
      message: this.contactForm.value.message!,
    };

    this.svc.contactProjectOwner(projectId, contactData).subscribe({
      next: () => {
        this.contactDialogVisible.set(false);
        this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Mensaje enviado correctamente.' });
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Error de envío', detail: err?.error?.message || 'No se pudo enviar el mensaje.' });
      },
    });
  }
  // ===== Acciones de Contrato (Firma y Cancelación) =====

  viewContract(contract: IContract): void {
    this.editing = null;
    this.reviewingToSign = null;
    this.viewingOnly.set(contract);
    this.contractForm.reset({
      title: contract.textTitle,
      amount: contract.amount,
      currency: contract.currency ?? 'USD',
      profit1Year: contract.profit1Year ? Number(contract.profit1Year) * 100 : 0,
      profit2Years: contract.profit2Years ? Number(contract.profit2Years) * 100 : 0,
      profit3Years: contract.profit3Years ? Number(contract.profit3Years) * 100 : 0,
      clauses: (contract as any).clauses ?? '',
    });
    this.contractForm.disable();
    this.accordionOpen.set(true);
  }

  reviewAndSignContract(contract: IContract): void {
    this.reviewingToSign = contract;
    this.viewingOnly.set(null);
    this.editing = null;
    this.contractForm.reset({
      title: contract.textTitle,
      amount: contract.amount,
      currency: contract.currency ?? 'USD',
      profit1Year: contract.profit1Year ? Number(contract.profit1Year) * 100 : 0,
      profit2Years: contract.profit2Years ? Number(contract.profit2Years) * 100 : 0,
      profit3Years: contract.profit3Years ? Number(contract.profit3Years) * 100 : 0,
      clauses: (contract as any).clauses ?? '',
    });
    this.contractForm.disable();
    this.accordionOpen.set(true);
  }

  rejectContract(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres rechazar el contrato "${contract.textTitle}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Rechazo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, rechazar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const studentId = this.currentUser?.id;
        if (!studentId) {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al usuario.' });
          return;
        }
        this.svc.cancelContractByStudent((contract as any).idContract, studentId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'warn', summary: 'Rechazado', detail: 'El contrato ha sido rechazado.' });
            this.cancelEdit();
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo rechazar el contrato.' })
        });
      }
    });
  }

  cancelContractByInvestor(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres retirar la oferta del contrato "${contract.textTitle}"?`,
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
        this.svc.cancelContractByInvestor((contract as any).idContract, investorId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'info', summary: 'Cancelado', detail: 'La oferta de contrato ha sido retirada.' });
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo cancelar la oferta.' })
        });
      }
    });
  }

  private confirmAndSign(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres firmar y aceptar los términos del contrato "${contract.textTitle}"? Esta acción no se puede deshacer.`,
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
        this.svc.signContract((contract as any).idContract, studentId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato firmado correctamente.' });
            this.cancelEdit();
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo firmar el contrato.' })
        });
      }
    });
  }

  private updateContractInList(updated: IContract): void {
    this.contracts.update(list =>
      list.map(c => c.idContract === updated.idContract ? updated : c)
    );
  }

  getProjectStatusLabel(status: string | null): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'PENDING_FUNDING': return 'Pendiente de Financiación';
      case 'COMPLETED': return 'Completado';
      default: return status || '—';
    }
  }

  getContractStatusLabel(status: IContract['status'] | string | null): string {
    switch (status) {
      case 'PENDING_STUDENT_SIGNATURE': return 'Pendiente Firma';
      case 'SIGNED': return 'Firmado';
      case 'CLOSED': return 'Cerrado';
      case 'CANCELLED': return 'Cancelado';
      case 'REFUNDED': return 'Devuelto';
      default: return status || '—';
    }
  }

  tagStyle(text: string, i = 0) {
    const palette = ['#e0f2fe', '#dcfce7', '#fee2e2', '#fef9c3', '#ede9fe'];
    const idx = Math.abs((text || '').length + i) % palette.length;
    return { background: palette[idx], color: '#111827', borderRadius: '9999px', padding: '0 8px', 'font-weight': 600 };
  }
}