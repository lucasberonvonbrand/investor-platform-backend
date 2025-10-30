import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitized = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitized.bypassSecurityTrustHtml(value || '');
  }
}