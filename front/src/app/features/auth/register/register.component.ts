import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="min-h-screen grid place-items-center p-6 bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 backdrop-blur text-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Crear una cuenta</h2>
      <p class="text-lg text-gray-500 dark:text-gray-400">Para continuar, por favor selecciona tu rol:</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <!-- Botón Estudiante -->
        <a routerLink="/create-student"
           class="group flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1">
          <i class="pi pi-user text-5xl text-blue-500 mb-3"></i>
          <span class="text-xl font-semibold text-gray-800 dark:text-gray-100">Soy Estudiante</span>
          <span class="text-sm text-gray-500 dark:text-gray-400 mt-1">Quiero crear proyectos</span>
        </a>

        <!-- Botón Inversor -->
        <a routerLink="/create-investor"
           class="group flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-transparent hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1">
          <i class="pi pi-briefcase text-5xl text-purple-500 mb-3"></i>
          <span class="text-xl font-semibold text-gray-800 dark:text-gray-100">Soy Inversor</span>
          <span class="text-sm text-gray-500 dark:text-gray-400 mt-1">Quiero financiar proyectos</span>
        </a>
      </div>

      <div class="text-center text-sm">
        <p class="text-gray-500 dark:text-gray-400 mt-6">
          ¿Ya tienes una cuenta? <a routerLink="/auth/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  </div>
  `,
})
export class RegisterComponent {
  // El componente ahora es puramente visual, la navegación se maneja con routerLink en la plantilla.
}
