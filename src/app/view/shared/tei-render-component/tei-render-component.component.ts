import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { XmlTransformService } from '../../../service/xml-transform.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface TeiElement {
  tagName: string;
  attributes?: { [key: string]: string };
  children?: TeiElement[];
  text?: string;
}

// interface for the flat structure
export interface FlatTeiElement {
  tagName: string;
  text?: string;
  attributes?: { [key: string]: string };
}

@Component({
  selector: 'app-tei-render-component',
  templateUrl: './tei-render-component.component.html',
  styleUrls: ['./tei-render-component.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeiRenderComponentComponent implements OnChanges {
  currentTooltip = '';

  constructor(
    private _cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private xmlTransformService: XmlTransformService
  ) {}

  @Input() teiXmlString = ''; // the TEI XML string to render
  @Input() stringToHighlight: string[] = []; // the string to highlight
  htmlString!: SafeHtml | undefined;

  ngOnChanges() {
    if(!this.teiXmlString) {
      return;
    }
    this.updateHtmlString();
  }

  updateHtmlString() {
    if (this.stringToHighlight.length === 0) {
      // When stringToHighlight is empty, reset the content without highlights
      this.htmlString = this.sanitizer.bypassSecurityTrustHtml(
        this.xmlTransformService.transformXmlToHtml(this.teiXmlString)
      );
    } else {
      // Apply highlighting when stringToHighlight is not empty
      this.htmlString = this.sanitizer.bypassSecurityTrustHtml(
        this.xmlTransformService.transformXmlToHtml(
          this.teiXmlString,
          this.stringToHighlight
        )
      );
    }
    this._cdr.detectChanges();
  }

  updateTooltip(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.currentTooltip = this.findTooltip(target);
    this._cdr.detectChanges();
  }

  // Recursive function to find the nearest parent with a tooltip
  findTooltip(element: HTMLElement | null): string {
    let depth = 0;
    while (element && !element.dataset['tooltip'] && depth < 5) {
      if (element.parentElement) {
        element = element.parentElement;
        depth++;
      } else {
        break;
      }
    }
    return element && element.dataset['tooltip']
      ? element.dataset['tooltip']
      : '';
  }
}
