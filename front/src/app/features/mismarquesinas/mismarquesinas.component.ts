import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 QUITAR esta línea porque no se usa en el template
// import { MarquesinaComponent } from '../../features/marquesina/marquesina.component';

interface CuadradoItem {
  text: string;
  img: string;
}

@Component({
  selector: 'app-mismarquesinas',
  standalone: true,
  // 👇 Dejar solo CommonModule
  imports: [CommonModule],
  templateUrl: './mismarquesinas.component.html',
  styleUrls: ['./mismarquesinas.component.scss']
})
export class MismarquesinasComponent implements OnInit {
  items: CuadradoItem[] = [
    { text: 'Tecnología', img: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { text: 'Educación', img: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80' },
    { text: 'Salud y Bienestar', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
    { text: 'Sostenibilidad y Medio Ambiente', img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
    { text: 'Arte y Cultura', img: 'https://images.unsplash.com/photo-1543906965-f9520aa2ed8a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { text: 'Financiero', img: 'https://images.unsplash.com/photo-1623106405790-0ed93dd15bab?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { text: 'Comercio Electrónico', img: 'https://plus.unsplash.com/premium_photo-1681487769650-a0c3fbaed85a?q=80&w=1555&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { text: 'Alimentos y Bebidas', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
    { text: 'Servicios Profesionales', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80' },
    { text: 'Impacto Social', img: 'https://plus.unsplash.com/premium_photo-1663047248264-24aa25b1433e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
  ];

  ngOnInit(): void {}
}
