import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PanelMenu } from 'primeng/panelmenu';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';

import { AuthService } from '../features/auth/login/auth.service';

import { StudentService } from '../core/services/students.service';
import { InvestorService } from '../core/services/investors.service'; 


@Component({
  selector: 'app-shell', // 👈 evita 'app-root' para no chocar con el root
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
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  sidebarCollapsed = false;
 isDark = document.documentElement.classList.contains('app-dark');

toggleDarkMode() {
  this.isDark = !this.isDark;
  document.documentElement.classList.toggle('app-dark', this.isDark);
  localStorage.setItem('theme:dark', String(this.isDark));
}

  private router = inject(Router);
  private auth = inject(AuthService);
    // private studentService: StudentService,
    // private investorService: InvestorService, // Descomenta si tienes este servicio
 

  @ViewChild('userMenu') userMenu!: Menu;

userItems = [
  { label: 'Mi perfil', icon: 'pi pi-user', command: () => this.go('/configuracion') },
  ...(this.auth.getSession()?.roles.includes('ROLE_INVESTOR') ? [{ label: 'Cuenta Inversor', icon: 'pi pi-briefcase', command: () => this.go('/inversor-perfil') } ] : []),
  ...(this.auth.getSession()?.roles.includes('ROLE_STUDENT') ? [ { label: 'Cuenta Estudiante', icon: 'pi pi-book', command: () => this.go('/estudiante-perfil') } ] : []),
  { label: 'Borrar cuenta', icon: 'pi pi-times', command: () => this.logout() },
  // { label: 'Borrar cuenta', icon: 'pi pi-times', command: () => this.borrarCuenta() },
  { separator: true },
  { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
];


  sideModel = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },

    { label: 'InicioINV+STU', icon: 'pi pi-home', routerLink: '/proyectos-panel' },
    {
      label: 'Gestión',
      icon: 'pi pi-database',
      items: [
        { label: 'Crear Proyecto', icon: 'pi pi-plus', routerLink: '/proyectos' },
        { label: 'Mis Proyectos', icon:'pi pi-pencil',routerLink:'/misproyectos'}
      ]
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        { label: 'Usuarios', icon: 'pi pi-users', routerLink: '/usuarios' },
        { label: 'Roles', icon: 'pi pi-id-card', routerLink: '/roles' },
        { label: 'Estudiantes', icon: 'pi pi-users', routerLink: '/estudiantes' },
        { label: 'Inversores', icon: 'pi pi-users', routerLink: '/inversores' }
      ]
    }


  ];

  toggleSidebar() { 
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('app-dark', this.isDark);
    localStorage.setItem('theme:dark', String(this.isDark));
  }
  openUserMenu(event: MouseEvent) { this.userMenu.toggle(event); }
  go(url: string) { this.router.navigateByUrl(url); }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

    /*  BORRAR CUENTA  Si quieres un popup más elegante, usa el componente Dialog de PrimeNG
borrarCuenta() {
    if (!confirm('¿Estás seguro de que deseas borrar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }
    const session = this.auth.getSession();
    if (!session) return;

    // Detecta el rol y llama al servicio correspondiente
    if (session.roles.includes('ROLE_STUDENT')) {
      this.studentService.delete(session.id).subscribe({
        next: () => {
          alert('Cuenta de estudiante eliminada');
          this.logout();
        },
        error: (err) => {
          alert('Error al borrar la cuenta de estudiante');
          console.error(err);
        }
      });
    } else if (session.roles.includes('ROLE_INVESTOR')) {
      // Descomenta si tienes InvestorService
      
      this.investorService.delete(session.id).subscribe({
        next: () => {
          alert('Cuenta de inversor eliminada');
          this.logout();
        },
        error: (err) => {
          alert('Error al borrar la cuenta de inversor');
          console.error(err);
        }
      });
      */
    }
