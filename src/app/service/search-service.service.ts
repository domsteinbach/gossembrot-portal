import { Injectable } from '@angular/core';
import { Isophonem, SearchResult, SearchResultTable } from '../model/search-result';
import { BehaviorSubject, take } from 'rxjs';
import { SearchDataRepository, SearchType } from '../data/repository/search-data-repository';

@Injectable()
export class SearchService {

  readonly OFFSET = 5; // Number of results to show before "show more" is needed

  readonly TYPE_LABELS: Record<SearchResultTable, string> = {
    author: 'Autoren und Autorinnen',
    carrier_text: 'Texte',
    info_carrier: 'Textträger',
    belegstelle: 'Verweise Gossembrots',
    naming_gossembrot: 'Benennungen Gossembrots',
    library: 'Bibliotheken',
  } as const;

  readonly GROUP_ORDER: { type: SearchResultTable; label: string }[] = [
    { type: 'author', label: this.TYPE_LABELS['author'] },
    { type: 'carrier_text', label: this.TYPE_LABELS['carrier_text'] },
    { type: 'belegstelle', label: this.TYPE_LABELS['belegstelle'] },
    { type: 'naming_gossembrot', label: this.TYPE_LABELS['naming_gossembrot'] },
    { type: 'info_carrier', label: this.TYPE_LABELS['info_carrier'] },
  ] as const;

  static readonly ISOPHONEMS: Isophonem[] = [
    { searchTerm: 'ss', includes: ['ʃʃ', 'ſſ'] },
    { searchTerm: 's', includes: ['ʃ', 'ſ'] },
    { searchTerm: 'y', includes: ['ÿ'] },
    { searchTerm: 'z', includes: ['ʒ'] },
    { searchTerm: 'oe', includes: ['oͤ'] },
    { searchTerm: '#.s', includes: ['ʃ', 'ſ'] },
    { searchTerm: '#.z', includes: ['ʒ'] },
    { searchTerm: '#;eo', includes: ['oͤ'] },
  ] as const;

  static readonly IGNORED_CHARACTERS = ['(', ')', '[...]', '|'] as const;

  readonly START_SEARCH_OFFSET = 2;

  private _startSearchTerm = '';
  private _startSearchResults: SearchResult[] = [];

  private _searchResults = new BehaviorSubject<SearchResult[]>([]);
  searchResults$ = this._searchResults.asObservable();

  searchType: SearchType = 'unset';

  constructor(private _search: SearchDataRepository) { }

  doSearch(searchTerm: string, searchType: SearchType): void {
    if(!searchTerm || searchTerm.length < this.START_SEARCH_OFFSET) {
      this._searchResults.next([]);
      return;
    }

    if (this._startSearchTerm !== searchTerm.substring(0,this.START_SEARCH_OFFSET) || this.searchType !== searchType || this.searchType !== 'unset') {
      this.searchType = searchType;
      this._restartSearch(searchTerm);
      return;
    }

    this._filterAndApplySearchResults(searchTerm);
  }

  clearResults(): void {
    this._searchResults.next([]);
    this._startSearchTerm = '';
    this._startSearchResults = [];
  }

  private _restartSearch(searchTerm: string): void {
    this._startSearchTerm = searchTerm.substring(0, this.START_SEARCH_OFFSET);
    const termsToSearch = this.searchType === 'unset' ? SearchService.expandWithAlternativeWritings(this._startSearchTerm) : searchTerm;
    this._search.fullTextSearch$(termsToSearch, this.searchType)
      .pipe(take(1))
      .subscribe((result: SearchResult[]) => {
        this._startSearchResults = result;
        this._filterAndApplySearchResults(searchTerm);
    });
  }

  private _filterAndApplySearchResults(searchTerm: string): void {
    const filterTerms = SearchService.expandWithAlternativeWritings(searchTerm);
    const filteredResults = this._startSearchResults.filter(r =>
      filterTerms.some(term => r.searchString.toLowerCase().includes(term.toLowerCase()))
    );
    this._searchResults.next(filteredResults);
  }

  static removeIgnoredCharactersAndTags(str: string): string {
    str = this.removeMilestoneTags(str);
    str = this.removeTags(str);
    return this.removeIgnoredCharacters(str);
  }

  static removeTags(str: string): string {
    return str.replace(/<[^>]+>/g, '');
  }

  static removeMilestoneTags(str: string): string {
    return str.replace(/<sig>.*?<\/sig>/gs, '')
  }

  static removeIgnoredCharacters(str: string): string {
    this.IGNORED_CHARACTERS.forEach((ignoredCharacter) => {
      const escapedCharacter = ignoredCharacter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedCharacter, 'g');
      str = str.replace(regex, '');
    })
    return str;
  }

  static expandWithAlternativeWritings(searchTerm: string): string[] {
    const expandedValues: string[] = [searchTerm];
    for (const isophonem of this.ISOPHONEMS) {
      if (searchTerm.includes(isophonem.searchTerm)) {
        for (const include of isophonem.includes) {
          const regex = new RegExp(isophonem.searchTerm, 'g');
          expandedValues.push(searchTerm.replace(regex, include));
        }
      }
    }
    return expandedValues;
  }

}
