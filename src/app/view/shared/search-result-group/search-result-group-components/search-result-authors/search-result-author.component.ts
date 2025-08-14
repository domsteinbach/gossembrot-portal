import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchResult } from '../../../../../model/search-result';
import { CarrierText } from '../../../../../model/carriertext';
import { SearchType } from '../../../../../data/repository/search-data-repository';

@Component({
  selector: 'app-search-result-author',
  templateUrl: './search-result-author.component.html',
  styleUrls: ['./search-result-author.component.scss', '../../search-result-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchResultAuthorComponent {
  @Input() authorsWithTexts: {
    author: SearchResult;
    texts: CarrierText[],
    foundByAlias?: string,
  }[] = [];

  @Input() includeFoundByAlias = true;

  @Input() searchTerm = '';

  expanded = new Map<string, boolean>();

  toggleTexts(id: string): void {
    if (!this.authorsWithTexts.length || !this.authorsWithTexts.find(p => p.texts.some(t => t.authorId === id) )) {
      return
    }
    this.expanded.set(id, !this.expanded.get(id) || false);
  }
}
