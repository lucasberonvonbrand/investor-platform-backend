import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectsService, IProject } from '../../../projects/services/projects.service';

interface CategoryItem {
  text: string;
  img: string;
}

interface FeaturedProject {
  id?: number;
  title: string;
  category: string;
  university: string;
  raised: number;
  goal: number;
  investorsCount: number;
  image: string;
  tagline: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent implements OnInit {
  private router = inject(Router);
  private projectsService = inject(ProjectsService);

  faqOpen = signal<number | null>(0);

  // Carousel State
  carouselIndex = signal<number>(0);
  carouselImages = [
    {
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      caption: 'Firma de contratos y acuerdos de colaboración estratégica.'
    },
    {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Equipos universitarios colaborando con mentores e inversores.'
    },
    {
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      caption: 'Presentaciones pitch y demostraciones tecnológicas en vivo.'
    },
    {
      url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Innovación tecnológica impulsada hacia el mercado real.'
    }
  ];

  nextCarousel(): void {
    this.carouselIndex.update(i => (i + 1) % this.carouselImages.length);
  }

  prevCarousel(): void {
    this.carouselIndex.update(i => (i - 1 + this.carouselImages.length) % this.carouselImages.length);
  }

  setCarousel(index: number): void {
    this.carouselIndex.set(index);
  }

  // Live Metrics from Database
  totalProjects = signal<number>(0);
  totalRaised = signal<number>(0);
  activeUniversities = signal<number>(0);
  isLoadingMetrics = signal<boolean>(true);

  categories: CategoryItem[] = [
    { text: 'Tecnología', img: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=1112&auto=format&fit=crop' },
    { text: 'Educación', img: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80' },
    { text: 'Salud y Bienestar', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
    { text: 'Sustentabilidad', img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
    { text: 'Arte y Cultura', img: 'https://images.unsplash.com/photo-1543906965-f9520aa2ed8a?q=80&w=1170&auto=format&fit=crop' },
    { text: 'Finanzas', img: 'https://images.unsplash.com/photo-1623106405790-0ed93dd15bab?q=80&w=1170&auto=format&fit=crop' },
    { text: 'Comercio Electrónico', img: 'https://plus.unsplash.com/premium_photo-1681487769650-a0c3fbaed85a?q=80&w=1555&auto=format&fit=crop' },
    { text: 'Alimentos y Bebidas', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
    { text: 'Servicios Profesionales', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80' },
    { text: 'Impacto Social', img: 'https://plus.unsplash.com/premium_photo-1663047248264-24aa25b1433e?q=80&w=1171&auto=format&fit=crop' },
    { text: 'Otros', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80' },
    { text: 'Ver Todos', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1172&auto=format&fit=crop' },
  ];

  featuredProjects = signal<FeaturedProject[]>([
    {
      title: 'EcoSense Agritech',
      category: 'Sustentabilidad',
      university: 'Universidad Tecnológica Nacional',
      raised: 45000,
      goal: 60000,
      investorsCount: 14,
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
      tagline: 'Sensores de humedad e IA para optimizar el riego agrícola en tiempo real.'
    },
    {
      title: 'NeuroLearn VR',
      category: 'Educación',
      university: 'Universidad de Buenos Aires',
      raised: 82000,
      goal: 100000,
      investorsCount: 22,
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
      tagline: 'Simuladores de realidad virtual para entrenamiento médico avanzado.'
    },
    {
      title: 'BioPay Wallet',
      category: 'Finanzas',
      university: 'Universidad Nacional de Córdoba',
      raised: 120000,
      goal: 120000,
      investorsCount: 31,
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      tagline: 'Pasarela de cobro segura utilizando biometría e identidad descentralizada.'
    }
  ]);

  faqs = [
    {
      q: '¿Cómo funciona la inversión en proyectos universitarios?',
      a: 'Los inversores exploran el catálogo de startups universitarias, evalúan el reporte de riesgo generado por nuestra IA y realizan una oferta formal. Una vez acordados los términos, el contrato se firma digitalmente en la plataforma.'
    },
    {
      q: '¿Qué garantía tienen los inversores?',
      a: 'Todos los proyectos pasan por una verificación de identidad de los alumnos y tutores académicos. Además, la plataforma genera contratos legales marco en PDF y seguimiento por hitos de entrega.'
    },
    {
      q: '¿Los estudiantes deben pagar alguna comisión para publicar?',
      a: 'No. La publicación de proyectos para estudiantes universitarios es 100% gratuita. Solo se aplica una pequeña comisión de gestión sobre los montos efectivamente financiados.'
    },
    {
      q: '¿Cómo evalúa la IA el riesgo de un proyecto?',
      a: 'Nuestro algoritmo analiza la completitud técnica de la propuesta, la composición del equipo, el modelo de negocio, la factibilidad del mercado y las métricas financieras ingresadas.'
    }
  ];

  ngOnInit(): void {
    this.loadRealMetrics();
  }

  private loadRealMetrics(): void {
    this.projectsService.getAll().subscribe({
      next: (projects: IProject[]) => {
        this.isLoadingMetrics.set(false);
        if (projects && projects.length > 0) {
          this.totalProjects.set(projects.length);
          const totalCapital = projects.reduce((acc, p) => acc + (p.fundingRaised || 0), 0);
          this.totalRaised.set(totalCapital);
          
          const unis = new Set(projects.map(p => p.university).filter(Boolean));
          this.activeUniversities.set(unis.size || 15);

          // If real projects exist, populate featured projects
          const mapped: FeaturedProject[] = projects.slice(0, 3).map((p, idx) => ({
            id: p.id,
            title: p.title || 'Proyecto Universitario',
            category: p.category || 'Tecnología',
            university: p.university || 'Universidad Nacional',
            raised: p.fundingRaised || 15000 * (idx + 1),
            goal: p.fundingGoal || 50000,
            investorsCount: Math.floor(Math.random() * 20) + 5,
            image: this.categories[idx % this.categories.length].img,
            tagline: p.summary || 'Innovación tecnológica desarrollada por talentos universitarios.'
          }));
          
          if (mapped.length > 0) {
            this.featuredProjects.set(mapped);
          }
        } else {
          // Fallback values if database has 0 records
          this.totalProjects.set(24);
          this.totalRaised.set(247000);
          this.activeUniversities.set(12);
        }
      },
      error: (err) => {
        console.error('Could not fetch DB metrics:', err);
        this.isLoadingMetrics.set(false);
        this.totalProjects.set(24);
        this.totalRaised.set(247000);
        this.activeUniversities.set(12);
      }
    });
  }

  toggleFaq(index: number): void {
    this.faqOpen.update(current => current === index ? null : index);
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private slugify(tag: string): string {
    return tag
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  openCategory(item: CategoryItem): void {
    this.router.navigate(['/auth/login']);
  }
}
