import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  isChatOpen = false;
  shouldShowChatbot = true;

  userMessage = '';
  messages: Message[] = [
    { text: '¡Hola! ¿En qué puedo ayudarte?', type: 'received' }
  ];

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.shouldShowChatbot = !this.router.url.includes('/auth/login');
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  selectQuestion(question: string) {
    this.messages.push({ text: question, type: 'sent' });
    this.getBotResponse(question);
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ text: this.userMessage, type: 'sent' });
    this.getBotResponse(this.userMessage);
    this.userMessage = '';
  }

  private getBotResponse(question: string) {
    // Simula una respuesta del bot después de un segundo
    setTimeout(() => {
      let response = 'Lo siento, no entendí tu pregunta. ¿Puedes reformularla?';
      if (question.toLowerCase().includes('crear proyecto')) {
        response = 'Para crear un proyecto, ve a la sección de "Gestión" y haz clic en "Crear Proyecto".';
      }
      this.messages.push({ text: response, type: 'received' });
    }, 1000);
  }
}
