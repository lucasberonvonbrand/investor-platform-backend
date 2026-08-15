import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-project-basic-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TooltipModule],
  template: `
    <div [formGroup]="parentForm()" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div class="md:col-span-2 pb-2 border-b border-[#1e293b] mt-2 flex items-center gap-2">
        <i class="pi pi-info-circle text-[#a78bfa]"></i>
        <h3 class="text-base font-extrabold text-white">Información General</h3>
      </div>

      <div class="md:col-span-2 flex flex-col gap-1.5">
        <label for="projectName" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Nombre del Proyecto *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Elige un nombre claro y conciso que identifique tu iniciativa."></i>
        </label>
        <input id="projectName" type="text" formControlName="name" 
               class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" 
               placeholder="Ej: Plataforma IoT para Monitoreo Agrícola" maxlength="80" />
      </div>

      <div class="md:col-span-2 flex flex-col gap-1.5">
        <label for="projectDescription" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Descripción General *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Detalla la visión, objetivos principales y solución que ofrece tu proyecto."></i>
        </label>
        <textarea id="projectDescription" formControlName="description" 
                  class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all min-h-[110px]" 
                  rows="4" placeholder="Describe brevemente el problema que resuelves y tu propuesta de valor..." maxlength="500"></textarea>
        <small class="text-red-400 text-xs" *ngIf="parentForm().get('description')?.errors?.['server']">
          {{ parentForm().get('description')?.errors?.['server'] }}
        </small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="projectTagName" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Categoría *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Selecciona el sector que mejor describa el campo de tu proyecto."></i>
        </label>
        <select id="projectTagName" formControlName="projectTagName" 
                class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all">
          <option value="" disabled selected>Selecciona una categoría</option>
          <option value="TECNOLOGÍA">TECNOLOGÍA</option>
          <option value="EDUCACIÓN">EDUCACIÓN</option>
          <option value="SALUD Y BIENESTAR">SALUD Y BIENESTAR</option>
          <option value="SOSTENIBILIDAD Y MEDIO AMBIENTE">SOSTENIBILIDAD Y MEDIO AMBIENTE</option>
          <option value="ARTE Y CULTURA">ARTE Y CULTURA</option>
          <option value="FINANCIERO">FINANCIERO</option>
          <option value="COMERCIO ELECTRÓNICO">COMERCIO ELECTRÓNICO</option>
          <option value="ALIMENTOS Y BEBIDAS">ALIMENTOS Y BEBIDAS</option>
          <option value="SERVICIOS PROFESIONALES">SERVICIOS PROFESIONALES</option>
          <option value="IMPACTO SOCIAL">IMPACTO SOCIAL</option>
          <option value="OTROS">OTROS</option>
        </select>
        <small class="text-red-400 text-xs" *ngIf="parentForm().get('projectTagName')?.errors?.['server']">
          {{ parentForm().get('projectTagName')?.errors?.['server'] }}
        </small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="budgetGoal" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Meta de Presupuesto (USD) *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Define la cantidad total de dinero requerida para llevar a cabo el proyecto."></i>
        </label>
        <input id="budgetGoal" type="number" formControlName="budgetGoal" 
               class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" 
               placeholder="Ej: 50000" step="0.01" min="0" />
      </div>
    </div>
  `
})
export class ProjectBasicInfoFormComponent {
  parentForm = input.required<FormGroup>();
}
