import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SearchResult } from '../../../../model/search-result';
import { Subject } from 'rxjs';
import { SearchService } from '../../../../service/search-service.service';
import { takeUntil } from 'rxjs/operators';
import { SearchType } from '../../../../data/repository/search-data-repository';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService]

})
export class HeaderSearchComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput', { static: true }) searchInputRef!: ElementRef;
  @ViewChild('searchPanel', { static: true }) searchPanelRef!: ElementRef;

  searchTerm = '';
  searchType: SearchType = 'unset';
  searchResults: SearchResult[] = [];

  private _destroy$ = new Subject<void>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _search: SearchService) {
  }

  ngOnInit() {
    document.addEventListener('click', this.handleClickOutside, true);
    this._search.searchResults$.pipe(takeUntil(this._destroy$)).subscribe((results: SearchResult[]) => {
      this.searchResults = results;
      this._cdr.markForCheck();
    });
  }

  doSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this._search.doSearch(searchTerm, this.searchType);
  }

  onClose() {
    this.searchTerm = '';
    this.searchType = 'unset';
    this.searchInputRef.nativeElement.value = '';
    this.searchInputRef.nativeElement.blur();
    this.searchResults = [];
    this._search.clearResults();
    this._cdr.detectChanges();
  }

  handleClickOutside = (event: MouseEvent) => {
    if (!this.searchPanelRef.nativeElement.contains(event.target)) {
      this.onClose();
    }
  };

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
    this._destroy$.next();
    this._destroy$.complete();
  }
}
