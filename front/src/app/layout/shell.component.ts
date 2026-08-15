import { Component, inject, signal, effect, computed } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { ChatbotComponent } from '../shared/components/chatbot/chatbot.component';

export interface IMenuSubItem {
  label: string;
  icon: string;
  routerLink: string;
}

export interface IMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  items?: IMenuSubItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ChatbotComponent
  ],
  templateUrl: './shell.component.html',
  styles: [
    `
    :host {
      display: block;
      height: 100dvh;
      --topbar-h: 64px;
    }
    .layout {
      height: calc(100dvh - var(--topbar-h));
      display: grid;
      grid-template-columns: 280px 1fr;
      grid-template-areas: "sidebar content";
      transition: grid-template-columns .25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .layout.collapsed {
      grid-template-columns: 80px 1fr;
    }
    .layout.no-sidebar {
      grid-template-columns: 1fr;
      grid-template-areas: "content";
    }
    .sidebar {
      grid-area: sidebar;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .content {
      grid-area: content;
      overflow: auto;
      padding: 1.5rem;
    }
    /* Style refinements when collapsed */
    .layout.collapsed .sidebar span {
      display: none;
    }
    .layout.collapsed .sidebar .menu-title {
      display: none;
    }
    .layout.collapsed .sidebar summary::after {
      display: none;
    }
    .layout.collapsed .sidebar details[open] > summary::after {
      display: none;
    }
    .layout.collapsed .sidebar details ul {
      padding-left: 0 !important;
      margin-left: 0 !important;
      border-left: none !important;
    }
    .layout.collapsed .sidebar .menu li {
      align-items: center;
    }
    .layout.collapsed .sidebar .menu li a {
      justify-content: center;
      width: 100%;
      padding: 0.75rem 0;
    }
    .layout.collapsed .sidebar .menu li details {
      width: 100%;
    }
    .layout.collapsed .sidebar .menu li details > summary {
      justify-content: center;
      width: 100%;
      padding: 0.75rem 0;
    }
    `
  ]
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
  
  currentUser = computed(() => this.auth.getSession());
  currentUserRoles = computed(() => this.auth.getSession()?.roles || []);
  hasSidebar = computed(() => this.auth.isLoggedIn && this.sideModel.length > 1);
  currentUserInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'U';
    const name = user.username || '';
    return name.slice(0, 2).toUpperCase();
  });

  private router = inject(Router);
  private auth = inject(AuthService);

  sideModel: IMenuItem[] = [];

  constructor() {
    this.buildSideMenu();
    document.documentElement.setAttribute('data-theme', 'aqua');
    document.documentElement.classList.remove('app-dark');
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  private buildSideMenu(): void {
    const session = this.auth.getSession();
    const roles = session?.roles || [];

    const isStudent = roles.includes('ROLE_STUDENT');
    const isInvestor = roles.includes('ROLE_INVESTOR');
    const isAdmin = roles.includes('ROLE_ADMIN');

    const menu: IMenuItem[] = [];

    if (isInvestor || isAdmin) {
      menu.push({ label: 'Catálogo de Proyectos', icon: 'pi pi-compass', routerLink: '/projects/catalog' });
    }

    if (isStudent) {
      menu.push({ label: 'Crear Proyecto', icon: 'pi pi-plus', routerLink: '/projects/create' });
      menu.push({ label: 'Mis Proyectos', icon: 'pi pi-pencil', routerLink: '/projects/my-projects' });
      menu.push({ label: 'Proyectos Participantes', icon: 'pi pi-users', routerLink: '/projects/participant' });
    }
    if (isInvestor) {
      menu.push({ label: 'Mis Inversiones', icon: 'pi pi-dollar', routerLink: '/investors/investments' });
    }
    
    if (isStudent || isInvestor) {
      menu.push({ label: 'Legal y Contratos', icon: 'pi pi-info-circle', routerLink: '/legales' });
    }

    if (isAdmin) {
      menu.push({ label: 'Tablero de Control', icon: 'pi pi-home', routerLink: '/admin/dashboard' });
      menu.push({ label: 'Gestionar Proyectos', icon: 'pi pi-list', routerLink: '/projects/admin' });
      menu.push({ label: 'Roles', icon: 'pi pi-id-card', routerLink: '/admin/roles' });
      menu.push({ label: 'Estudiantes', icon: 'pi pi-users', routerLink: '/students/admin' });
      menu.push({ label: 'Inversores', icon: 'pi pi-users', routerLink: '/investors/admin' });
    }

    this.sideModel = menu;
  }
}