import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './features/chatbot/chatbot.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotComponent],
  template: `
    <router-outlet />
    <app-chatbot />
  `
})
export class AppRootComponent {}
