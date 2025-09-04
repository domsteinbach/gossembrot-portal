import { combineLatest, map, Observable, of, shareReplay, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataService } from '../dataservice.service';
import { Author } from '../../model/author';
import { GndAuthor } from '../../model/gnd-authors';

@Injectable({
  providedIn: 'root',
})
export class AuthorRepository {
  private _cachedAuthors: Author[] = [];
  private cachedAuthors$: Observable<Author[]> | undefined;

  private _authors$ = this._dataService.getDataAs$(Author);
  private _gndAuthors$ = this._dataService.getDataAs$(GndAuthor);

  constructor(private _dataService: DataService) {}

  authors$(): Observable<Author[]> {
    if (this._cachedAuthors.length && this.cachedAuthors$) {
      return of(this._cachedAuthors);
    }

    this.cachedAuthors$ = this._getAuthorsWithGnd$().pipe(
      tap(authors => this._cachedAuthors = authors),
      shareReplay(1)
    );

    return this.cachedAuthors$;
  }

  private _getAuthorsWithGnd$(): Observable<Author[]> {
    return combineLatest(this._authors$, this._gndAuthors$).pipe(
      map(([authors, gndAuthors]) => {
        return authors.map(author => {
          const gnd = gndAuthors.find(g => g.gndId === author.gndId);
          if (gnd) {
            author.gndData = gnd;
          }
          return author;
        });
      })
    );
  }
}
