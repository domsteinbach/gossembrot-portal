import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightBoldPipe implements PipeTransform {
  transform(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<span class="highlighted-substr">$1</span>'
    );
  }
}
