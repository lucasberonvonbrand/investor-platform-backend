import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, RouterLink } from '@angular/router'; // RouterLink ya estaba en una de las versiones
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button'; // (lo podés quitar si ya no usás el modal)
import { DialogModule } from 'primeng/dialog';            // (lo podés quitar si ya no usás el modal)
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MenuModule } from 'primeng/menu'; // Módulo que faltaba

import { ProjectsMasterService } from '../../../core/services/projects-master.service';
import { AuthService, Session } from '../../auth/login/auth.service';
import type { ContactOwnerDTO } from '../../../core/services/projects-master.service';
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
    // Versión corregida y unificada de los imports
    ButtonModule, DialogModule, InputTextModule, InputNumberModule, EditorModule, ConfirmDialogModule, SliderModule, TooltipModule, ProgressBarModule, MenuModule, RouterLink,
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

  fundingProgress = computed(() => {
    const p = this.project();
    if (!p || !p.fundingGoal || p.fundingGoal <= 0 || !p.fundingRaised) {
      return 0;
    }
    // Calcula el porcentaje y lo limita a un máximo de 100
    return Math.min(100, (p.fundingRaised / p.fundingGoal) * 100);
  });

  contracts = signal<IContract[]>([]);
  loading = signal<boolean>(false);

  // ===== Acordeón Crear/Editar contrato =====
  accordionOpen = signal<boolean>(false);
  editing: IContract | null = null;
  viewingOnly = signal<IContract | null>(null);

  currentContractStatus = computed<IContract['status'] | 'PENDING_STUDENT_SIGNATURE'>(() => {
    const contractInView = this.viewingOnly() || this.reviewingToSign || this.editing;
    return contractInView?.status || 'PENDING_STUDENT_SIGNATURE';
  });
  currentContractStatusLabel = computed(() => this.getContractStatusLabel(this.currentContractStatus()));

  reviewingToSign: IContract | null = null; // Nuevo estado para cuando un estudiante revisa un contrato para firmar
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
    clauses: [''], // Campo para el editor de texto
  });
  
  contractTemplates: MenuItem[] = [];

  // ===== Formulario de Contacto =====
  contactDialogVisible = signal(false);
  contactForm = this.fb.group({
    subject: ['', Validators.required],
    message: ['', Validators.required],
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
    this.setupContractTemplates();
  }

  goBack(): void {
    window.history.back();
  }

  private loadProject(): void {
    this.loading.set(true);
    this.svc.getProjectById(this.projectId()).subscribe({
      next: (p: IMyProject | null) => {
        this.project.set(p || null);
        this.setupContractTemplates(); // Volver a generar las plantillas con el título del proyecto
      },
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

  // ===== Crear / Editar contrato (Acordeón) =====
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
      clauses: (row as any).description ?? '', // Cargar la descripción en el campo 'clauses' del form
    });
    this.accordionOpen.set(true);
  }

  cancelEdit(): void {
    this.accordionOpen.set(false);
    this.editing = null;
    this.reviewingToSign = null;
    this.viewingOnly.set(null);
    this.contractForm.enable(); // Habilitar el formulario al cancelar
  }

  saveContract(): void {
    // Si estamos en modo "revisar para firmar", llamamos a la función de firma
    if (this.reviewingToSign) {
      this.confirmAndSign(this.reviewingToSign);
      return;
    }

    // Si no, es un inversor creando/editando. Validamos.
    if (this.contractForm.invalid || !this.isInvestor()) return;

    let dto: any; // Usamos 'any' para permitir el campo 'description' que no está en IContract
    const raw = this.contractForm.getRawValue();

    if (this.editing) {
      // Payload para ACTUALIZAR un contrato existente
      dto = { // @ts-ignore
        idContract: this.editing.idContract,
        projectId: this.projectId(),
        title: raw.title,
        amount: raw.amount,
        currency: raw.currency as IContract['currency'],
        profit1Year: raw.profit1Year,
        profit2Years: raw.profit2Years,
        profit3Years: raw.profit3Years,
        description: raw.clauses, // Mapear 'clauses' del form a 'description' del DTO
        status: this.editing.status, // Mantenemos el status actual al editar
        createdByInvestorId: this.currentUser?.id,
      };
    } else {
      // Payload para CREAR un nuevo contrato (según el formato requerido por el backend)
      dto = {
        projectId: this.projectId(),
        createdByInvestorId: this.currentUser?.id,
        textTitle: raw.title, // El backend espera 'textTitle'
        amount: raw.amount,
        currency: raw.currency as IContract['currency'],
        profit1Year: raw.profit1Year,
        profit2Years: raw.profit2Years,
        profit3Years: raw.profit3Years,
        description: raw.clauses, // Mapear 'clauses' del form a 'description' del DTO
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
        let detail = err?.error?.message || 'No se pudo guardar el contrato.';
        // Captura el error específico de truncamiento de datos
        if (typeof detail === 'string' && detail.includes("Data too long for column 'description'")) {
          detail = 'El contenido de las cláusulas es demasiado largo. Por favor, reduce el texto o el formato.';
        }
        this.toast.add({ severity: 'error', summary: 'Error al guardar', detail: detail, life: 6000 });
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

  // ===== Lógica de Contacto al Dueño del Proyecto =====

  /**
   * Abre el diálogo para contactar al líder del proyecto.
   */
  openContactDialog(): void {
    this.contactForm.reset();
    this.contactDialogVisible.set(true);
  }

  /**
   * Envía el correo electrónico al líder del proyecto a través del backend.
   */
  sendContactEmail(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // 1. Obtener la sesión actual.
    const session = this.auth.getSession();
    const projectId = this.projectId();

    // 2. Validar que la sesión y el email existan.
    if (!session || !session.email) {
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo identificar tu email. Por favor, inicia sesión de nuevo.'
      });
      return;
    }

    // 3. Construir el payload con los datos REALES de la sesión.
    const contactData: ContactOwnerDTO = {
      fromEmail: session.email,       // <-- USA EL EMAIL REAL
      fromName: session.username,     // <-- USA EL USERNAME PARA EL NOMBRE
      subject: this.contactForm.value.subject!,
      message: this.contactForm.value.message!,
    };

    // 3. Realizar la petición POST con el payload corregido
    this.svc.contactProjectOwner(projectId, contactData).subscribe({
      next: () => {
        this.contactDialogVisible.set(false);
        this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Mensaje enviado correctamente.' });
      },
      error: (err) => {
        console.error('Error al enviar el mensaje de contacto:', err);
        const detail = err?.error?.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.';
        this.toast.add({ severity: 'error', summary: 'Error de envío', detail });
      },
    });
  }

  // ===== Acciones de Contrato (Firma y Cancelación) =====

  /** Abre el panel para ver un contrato en modo solo lectura */
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
      clauses: (contract as any).description ?? '',
    });
    this.contractForm.disable();
    this.accordionOpen.set(true);
  }
  /** El estudiante hace clic en "Firmar", se abre el panel para revisar */
  reviewAndSignContract(contract: IContract): void {
    this.reviewingToSign = contract;
    this.viewingOnly.set(null); // Limpiar el estado de solo vista
    this.editing = null; // Nos aseguramos de no estar en modo edición
    this.contractForm.reset({
      title: contract.textTitle,
      amount: contract.amount,
      currency: contract.currency ?? 'USD',
      profit1Year: contract.profit1Year ? Number(contract.profit1Year) * 100 : 0,
      profit2Years: contract.profit2Years ? Number(contract.profit2Years) * 100 : 0,
      profit3Years: contract.profit3Years ? Number(contract.profit3Years) * 100 : 0,
      clauses: (contract as any).description ?? '',
    });
    this.contractForm.disable(); // Hacemos el formulario de solo lectura
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
            this.cancelEdit(); // Cierra el panel
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

  /** Lógica de confirmación y firma, llamada desde saveContract */
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
            this.cancelEdit(); // Cierra el panel
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
