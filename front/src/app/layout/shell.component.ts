import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PanelMenu } from 'primeng/panelmenu';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../features/auth/login/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    PanelMenu,
    Menu,
    Button,
    Avatar,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  @ViewChild('userMenu') userMenu!: Menu;

  // UI state
  sidebarCollapsed = false;
  isDark = document.documentElement.classList.contains('app-dark');

  // Menús
  userItems: MenuItem[] = [];
  sideModel: MenuItem[] = [];

  ngOnInit(): void {
    this.buildUserMenu();
    this.buildSideModel();
  }

  // ===== Helpers de roles =====
  hasRole(role: string): boolean {
    try {
      const raw = localStorage.getItem('auth_user') ?? localStorage.getItem('pp_user');
      const u = raw ? JSON.parse(raw) as { roles?: string[] } : null;
      return Array.isArray(u?.roles) && u.roles.includes(role);
    } catch {
      return false;
    }
  }

  // ===== Menús =====
  private buildUserMenu(): void {
    this.userItems = [
      { label: 'Mi perfil', icon: 'pi pi-user', command: () => this.go('/mi-perfil') },
      { separator: true },
      { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
    ];
  }

  private buildSideModel(): void {
    const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
      { label: 'InicioINV+STU', icon: 'pi pi-home', routerLink: '/proyectos-panel' },
      {
        label: 'Gestión',
        icon: 'pi pi-database',
        items: [
          { label: 'Crear Proyecto', icon: 'pi pi-plus', routerLink: '/proyectos' },

          // Solo estudiantes
          ...(this.hasRole('ROLE_STUDENT') ? [
            { label: 'Mis Proyectos', icon: 'pi pi-pencil', routerLink: '/my-projects' },
          ] : []),

          // Solo inversores (ruta corregida)
          ...(this.hasRole('ROLE_INVESTOR') ? [
            { label: 'Mis Inversiones', icon: 'pi pi-briefcase', routerLink: '/mis-inversiones' },
          ] : []),

          { label: 'Mis Marquesinas', icon: 'pi pi-images', routerLink: '/mismarquesinas' },
          { label: 'Marquesinas',     icon: 'pi pi-images', routerLink: '/marquesinas' },
          { label: 'Noticias',        icon: 'pi pi-bell',   routerLink: '/noticias' },
        ]
      },
      {
        label: 'Reportes',
        icon: 'pi pi-chart-line',
        items: [{ label: 'Dashboard', icon: 'pi pi-chart-bar', disabled: true }]
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        items: [
          { label: 'Usuarios',    icon: 'pi pi-users',   routerLink: '/usuarios' },
          { label: 'Roles',       icon: 'pi pi-id-card', routerLink: '/roles' },
          { label: 'Estudiantes', icon: 'pi pi-users',   routerLink: '/estudiantes' },
          { label: 'Inversores',  icon: 'pi pi-users',   routerLink: '/inversores' },
        ]
      }
    ];

    this.sideModel = items;
  }

  // ===== Acciones UI =====
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed; // ahora realmente colapsa el sidebar
  }

  toggleDarkMode() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('app-dark', this.isDark);
    localStorage.setItem('theme:dark', String(this.isDark));
  }

  openUserMenu(event: MouseEvent) {
    this.userMenu?.toggle(event);
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
