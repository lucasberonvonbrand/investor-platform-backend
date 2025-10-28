import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatResponse } from '../../core/services/chatbot.service';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(private router: Router, private chatService: ChatbotService, private sanitizer: DomSanitizer) {
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

  toHtml(markdown?: string): SafeHtml {
    if (!markdown) {
      return this.sanitizer.bypassSecurityTrustHtml(''); // devuelve SafeHtml vacío
    }

    const html = (marked.parse ? marked.parse(markdown) : marked(markdown)) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private getBotResponse(question: string) {
    this.messages.push({ text: '...', type: 'received' });

    this.chatService.sendMessage(question).subscribe({
      next: (res: string) => {
        const botText: string = res ?? ' ';

        const idx = this.messages.findIndex(m => m.type === 'received' && m.text === '...');
        if (idx >= 0) {
          this.messages[idx] = { text: botText, type: 'received' };
        } else {
          this.messages.push({ text: botText, type: 'received' });
        }
      },
      error: (err) => {
        console.error('Chat error:', err);
        const idx = this.messages.findIndex(m => m.type === 'received' && m.text === '...');
        const errMsg = 'Error: no se recibió respuesta';
        if (idx >= 0) {
          this.messages[idx] = { text: errMsg, type: 'received' };
        } else {
          this.messages.push({ text: errMsg, type: 'received' });
        }
      }
    });
  }
}
