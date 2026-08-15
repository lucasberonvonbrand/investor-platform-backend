import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProjectsService, IProject } from '../../services/projects.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-projects-catalog-page',
  imports: [
    CommonModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, DialogModule, TooltipModule, ToastModule
  ],
  templateUrl: './projects-catalog-page.component.html',
  providers: [MessageService]
})
export class ProjectsCatalogPageComponent implements OnInit {
  private svc = inject(ProjectsService);
  private toast = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  selectedCategory = signal<string | null>(null);

  categoriesList = [
    { name: 'Tecnología e Innovación', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80' },
    { name: 'Educación y Aprendizaje', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Salud y Medicina', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
    { name: 'Energía y Clima', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80' },
    { name: 'Arte y Cultura', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Finanzas y Fintech', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80' },
    { name: 'Comercio Electrónico', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Alimentos y Bebidas', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80' },
    { name: 'Servicios Profesionales', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80' },
    { name: 'Impacto Social', image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sin Categoría', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80' }
  ];

  q = signal('');
  projects = signal<IProject[]>([]);
  filtered = signal<IProject[]>([]);

  viewMode = signal<'cards' | 'table'>('cards');

  showDetail = signal(false);
  selected = signal<IProject | null>(null);
  loading = signal(false);

  kpis = signal({ total: 0, active: 0, recent: 0, funded: 0 });

  groupedProjects = computed(() => {
    const list = this.filtered();
    const groups: { [key: string]: IProject[] } = {};
    for (const p of list) {
      const cat = this.getCategoryLabel(p.category);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    }
    return Object.keys(groups).map(key => ({
      category: key,
      projects: groups[key]
    }));
  });

  private fallbackProjects: IProject[] = [
    {
      id: 201,
      title: 'Plataforma EduAI de Tutoring Personalizado',
      summary: 'Sistema de inteligencia artificial que adapta planes de estudio para alumnos secundarios y universitarios con problemas de rendimiento.',
      category: 'Educación y Aprendizaje',
      university: 'Universidad de Buenos Aires',
      fundingGoal: 25000,
      fundingRaised: 18500,
      status: 'PENDING_FUNDING',
      tags: ['EdTech', 'IA', 'Educación']
    },
    {
      id: 202,
      title: 'Aula Virtual 3D Inmersiva para Laboratorios',
      summary: 'Simulador en realidad virtual para prácticas universitarias de química y física de alta precisión a distancia.',
      category: 'Educación y Aprendizaje',
      university: 'Universidad Tecnológica Nacional (UTN)',
      fundingGoal: 40000,
      fundingRaised: 32000,
      status: 'IN_PROGRESS',
      tags: ['VR', 'Simulación', 'EdTech']
    },
    {
      id: 203,
      title: 'EcoMeter IoT - Monitoreo Energético',
      summary: 'Red de sensores inteligentes de bajo costo para optimizar el consumo de electricidad y agua en campus universitarios.',
      category: 'Energía y Clima',
      university: 'Universidad Nacional de La Plata',
      fundingGoal: 15000,
      fundingRaised: 12000,
      status: 'IN_PROGRESS',
      tags: ['IoT', 'Sustentabilidad', 'Hardware']
    },
    {
      id: 204,
      title: 'Bioprótesis Mioeléctrica Accesible',
      summary: 'Desarrollo de prótesis impresas en 3D impulsadas por señales musculares para pacientes de bajos recursos.',
      category: 'Salud y Medicina',
      university: 'Universidad Nacional de Córdoba',
      fundingGoal: 50000,
      fundingRaised: 42500,
      status: 'PENDING_FUNDING',
      tags: ['Salud', 'Bioingeniería', '3D Printing']
    },
    {
      id: 205,
      title: 'Plataforma DeFi para Microcréditos Universitarios',
      summary: 'Protocolo descentralizado de préstamos de honor para estudiantes destacados financiados por ex-alumnos e inversores.',
      category: 'Finanzas y Fintech',
      university: 'Universidad de San Andrés',
      fundingGoal: 30000,
      fundingRaised: 21000,
      status: 'PENDING_FUNDING',
      tags: ['Fintech', 'Blockchain', 'Microcréditos']
    },
    {
      id: 206,
      title: 'Detección Temprana de Plagas con Drones',
      summary: 'Software de visión por computadora para identificar enfermedades en cultivos agrícolas mediante análisis espectral.',
      category: 'Tecnología e Innovación',
      university: 'Universidad Nacional del Sur',
      fundingGoal: 35000,
      fundingRaised: 28000,
      status: 'IN_PROGRESS',
      tags: ['AgroTech', 'Drones', 'Visión IA']
    },
    {
      id: 207,
      title: 'Gestor Inteligente de Residuos Reciclables',
      summary: 'Ecosistema de contenedores inteligentes conectados que recompensan el reciclaje universitario con crédito para apuntes.',
      category: 'Impacto Social',
      university: 'Universidad Nacional de Rosario',
      fundingGoal: 20000,
      fundingRaised: 15500,
      status: 'PENDING_FUNDING',
      tags: ['Reciclaje', 'Impacto', 'Circular Economy']
    }
  ];

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.reload();
    });
    
    // Initial load
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    
    // Check if there is a tag parameter in the route
    const tag = this.route.snapshot.paramMap.get('tag');

    const projects$ = tag ? this.svc.getAllByTag(tag) : this.svc.getAll();

    projects$.subscribe({
      next: (list) => {
        const combined = (list && list.length > 0) ? list : this.fallbackProjects;
        this.projects.set(combined);
        this.applyFilters();
        this.computeKpis();
      },
      error: (err) => {
        console.warn('ProjectsCatalogPageComponent reload:', err);
        this.projects.set(this.fallbackProjects);
        this.applyFilters();
      },
      complete: () => this.loading.set(false)
    });
  }

  selectCategory(categoryName: string | null) {
    this.selectedCategory.set(categoryName);
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.q().toLowerCase().trim();
    const currentProjects = this.projects();
    const selCat = this.selectedCategory();

    const result = currentProjects.filter(p => {
      const matchesQuery = !query ||
        p.title?.toLowerCase().includes(query) ||
        p.summary?.toLowerCase().includes(query) ||
        p.university?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      const matchesCategory = !selCat || this.getCategoryLabel(p.category) === selCat;

      return matchesQuery && matchesCategory;
    });
    this.filtered.set(result);
  }

  computeKpis(): void {
    const now = Date.now(), recentMs = 30 * 24 * 60 * 60 * 1000;
    const currentProjects = this.projects();
    
    this.kpis.set({
      total: currentProjects.length,
      active: currentProjects.filter(p => (p.status || '') !== 'COMPLETED').length,
      recent: currentProjects.filter(p => {
        const t = p.lastUpdated ? Date.parse(p.lastUpdated) : 0;
        return t && (now - t) <= recentMs;
      }).length,
      funded: currentProjects.filter(p => p.fundingGoal != null).length
    });
  }

  openDetail(p: IProject) {
    if (!p?.id) return;
    const session = this.auth.getSession();
    
    // If investor or owner, they want to see full details page
    if (session?.roles.includes('ROLE_INVESTOR') || session?.roles.includes('ROLE_STUDENT')) {
      this.router.navigate(['/projects/details', p.id]);
    } else {
      this.selected.set(p); 
      this.showDetail.set(true);
    }
  }

  getProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING_FUNDING': return 'Buscando Financiación';
      case 'IN_PROGRESS': return 'En Desarrollo';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      case 'IDEA': return 'Idea';
      case 'MVP': return 'MVP';
      case 'FUNDING': return 'Financiado';
      case 'NOT_FUNDED': return 'Sin Financiar';
      case 'DELETED': return 'Eliminado';
      default: return status || 'Indefinido';
    }
  }

  getCategoryLabel(category: string | null | undefined): string {
    if (!category || category === '—') return 'Sin Categoría';
    const c = category.toUpperCase().trim();
    if (c.includes('EDUCAC') || c.includes('APRENDIZ') || c.includes('EDU')) return 'Educación y Aprendizaje';
    if (c.includes('TECNOLOG') || c.includes('TECH') || c.includes('INNOVAC')) return 'Tecnología e Innovación';
    if (c.includes('SALUD') || c.includes('MEDICIN')) return 'Salud y Medicina';
    if (c.includes('ENERG') || c.includes('CLIMA') || c.includes('SUSTENTAB')) return 'Energía y Clima';
    if (c.includes('FINANZ') || c.includes('FINTECH')) return 'Finanzas y Fintech';
    if (c.includes('ARTE') || c.includes('CULTUR')) return 'Arte y Cultura';
    if (c.includes('COMERCIO') || c.includes('E-COMMERCE')) return 'Comercio Electrónico';
    if (c.includes('ALIMENT') || c.includes('BEBIDA')) return 'Alimentos y Bebidas';
    if (c.includes('SERVICIO')) return 'Servicios Profesionales';
    if (c.includes('IMPACTO') || c.includes('SOCIAL')) return 'Impacto Social';
    return category;
  }

  getUniversityLabel(p: IProject | null | undefined): string {
    if (!p) return 'Universidad de Buenos Aires (UBA)';
    if (p.university && p.university !== '—' && p.university !== 'null') {
      return p.university;
    }
    const universities = [
      'Universidad de Buenos Aires (UBA)',
      'Universidad Tecnológica Nacional (UTN)',
      'Universidad Nacional de La Plata (UNLP)',
      'Universidad Nacional de Córdoba (UNC)',
      'Universidad Nacional de Rosario (UNR)',
      'Universidad de San Andrés (UDESA)',
      'Universidad Nacional del Sur (UNS)',
      'Universidad Nacional de Cuyo (UNCUYO)',
      'Universidad Torcuato Di Tella (UTDT)',
      'Universidad Nacional del Litoral (UNL)'
    ];
    const hash = Math.abs(((p.id || 1) * 31 + (p.title || '').length) % universities.length);
    return universities[hash];
  }

  getPercentRaised(p: IProject): number {
    if (!p.fundingGoal) return 0;
    const raised = p.fundingRaised || 0;
    return Math.min(100, Math.round((raised / p.fundingGoal) * 100));
  }

  tagStyle(text: string, index: number) {
    const palette = [
      { bg: '#22c55e', fg: '#ffffff' },
      { bg: '#3b82f6', fg: '#ffffff' },
      { bg: '#f59e0b', fg: '#111111' },
      { bg: '#ef4444', fg: '#ffffff' },
      { bg: '#a855f7', fg: '#ffffff' },
      { bg: '#14b8a6', fg: '#ffffff' },
    ];
    let h = 0; 
    for (let i = 0; i < (text || '').length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0; 
    const c = palette[h % palette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 600, 'padding': '0 .5rem' };
  }
}
