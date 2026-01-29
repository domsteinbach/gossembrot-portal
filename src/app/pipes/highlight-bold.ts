import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "highlight" })
export class HighlightBoldPipe implements PipeTransform {
  transform(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    return text.replace(
      regex,
      (match) => `<span class="highlighted-substr">${match}</span>`,
    );
  }
}
