import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Page } from '../../../../../model/page';
import { Select } from '@ngxs/store';
import { DisplayedPagesState } from '../../../../../state/app-state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-doppellagen-info-text',
  templateUrl: './doppellagen-info-text.component.html',
  styleUrls: ['./doppellagen-info-text.component.scss'],
})
export class DoppellagenInfoTextComponent implements OnDestroy {
  private _destroy = new Subject<void>();
  @Select(DisplayedPagesState)
  private _displayedPages$!: Observable<Page[]>;

  displayedPages: Page[] = [];

  lagenText = '';

  constructor() {
    this._displayedPages$
      .pipe(takeUntil(this._destroy))
      .subscribe((dp: Page[]) => {
        this.displayedPages = dp;
        this.setLagentext(dp);
      });
  }

  setLagentext(pages: Page[]) {
    if (!pages.length) {
      this.lagenText = '';
      return;
    }

    this.lagenText = pages[0].doppellagenText
      ? pages[0].doppellagenText
      : pages[1]?.doppellagenText;
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }
}
