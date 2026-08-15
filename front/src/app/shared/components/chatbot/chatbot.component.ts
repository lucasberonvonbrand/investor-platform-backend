import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';
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
  styles: [`
    :host {
      --chat-primary-color: #4f46e5;
      --chat-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    }

    .chat-fab {
      position: fixed;
      bottom: 32px;
      left: 32px;
      background: var(--chat-gradient);
      border-radius: 50%;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1000;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);

        .chat-icon {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .close-icon {
          font-size: 2rem;
          color: white;
        }
      }

      &.open .icon-wrapper {
        transform: rotate(180deg);
      }

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(79, 70, 229, 0.5);
      }
    }

    .help-bubble {
      position: fixed;
      bottom: 40px;
      left: 108px;
      background: var(--chat-primary-color);
      color: white;
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 999;
      animation: fadeInOut 12s ease-in-out forwards;

      &::after {
        content: '';
        position: absolute;
        bottom: 12px;
        left: -8px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 8px solid var(--chat-primary-color);
      }
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0; transform: translateY(10px); }
      10%, 90% { opacity: 1; transform: translateY(0); }
    }

    .chat-window {
      position: fixed;
      bottom: 110px;
      left: 32px;
      width: 350px;
      max-height: 550px;
      max-width: 90vw;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      z-index: 1001;
      transform: translateY(20px);
      opacity: 0;
      visibility: hidden;
      transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s;

      &.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .chat-header {
        background: var(--chat-gradient);
        color: #fff;
        padding: 16px;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.4rem;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s, transform 0.2s;
          &:hover {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      }

      .chat-body {
        padding: 16px;
        flex: 1;
        overflow-y: auto;
        height: 350px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message {
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 0.95rem;
          max-width: 80%;
          line-height: 1.4;
          animation: slideIn 0.3s ease-out;
          &.received {
            background: #f1f1f1;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
          }
          &.sent {
            background: var(--chat-primary-color);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }

          &.typing-indicator {
            padding: 14px 18px;
            span {
              height: 8px;
              width: 8px;
              background-color: #9ca3af;
              border-radius: 50%;
              display: inline-block;
              animation: bounce 1.4s infinite ease-in-out both;
            }
            span:nth-child(1) { animation-delay: -0.32s; }
            span:nth-child(2) { animation-delay: -0.16s; }
          }
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        .preset-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
          .preset-btn {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 8px 14px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s;
            &:hover {
              background-color: #e5e7eb;
            }
          }
        }
      }

      .chat-footer {
        padding: 16px;
        display: flex;
        gap: 8px;
        border-top: 1px solid #e5e7eb;
        input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          transition: border-color 0.2s, box-shadow 0.2s;
          &:focus {
            outline: none;
            border-color: var(--chat-primary-color);
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
          }
        }
        button {
          background: var(--chat-primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 16px;
          cursor: pointer;
          transition: background-color 0.2s;
          &:hover {
            background: #4338ca;
          }
        }
      }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  isChatOpen = false;
  shouldShowChatbot = false;
  showHelpBubble = false;
  isBotTyping = false;

  userMessage = '';
  messages: Message[] = [
    { text: '¡Hola! ¿En qué puedo ayudarte?', type: 'received' }
  ];

  constructor(private router: Router, private chatService: ChatbotService, private sanitizer: DomSanitizer) {
    this.router.events.subscribe(() => {
      this.shouldShowChatbot = false;
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.showHelpBubble = true;
    }, 3000);

    setTimeout(() => {
      this.showHelpBubble = false;
    }, 15000);
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    this.showHelpBubble = false;
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
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const html = (marked.parse ? marked.parse(markdown) : marked(markdown)) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private getBotResponse(question: string) {
    this.isBotTyping = true;

    this.chatService.sendMessage(question).subscribe({
      next: (res: string) => {
        this.isBotTyping = false;
        const botText: string = res ?? ' ';
        this.messages.push({ text: botText, type: 'received' });
      },
      error: (err) => {
        this.isBotTyping = false;
        console.error('Chat error:', err);
        this.messages.push({ text: 'Error: no se recibió respuesta', type: 'received' });
      }
    });
  }
}
