import { Injectable } from '@angular/core';
import {
  Store,
} from '@ngxs/store';
import {
  SelectedCarrierPagesState,
  SelectedPageState,
  UpdateSelectedCarrierText, UpdateSelectedPage,
} from '../state/app-state';
import { Observable, take } from 'rxjs';
import { CarrierText } from '../model/carriertext';
import {CarrierTextsState} from '../state/carriertext-state';
import { Page } from '../model/page';

@Injectable({
  providedIn: 'root',
})
export class CarrierTextService {

  private _existingTexts: CarrierText[] = [];
  private _selectedText!: CarrierText | undefined;

  private _lastTextId = '';
  private _firstTextId = '';

  private _selectedPage$: Observable<Page> = this._store.select(SelectedPageState);
  private _selectedPage!: Page;

  private _selectedCarriersTexts$ = this._store.select(CarrierTextsState.getSelectedCarriersTexts);

  constructor(
    private _store: Store,
  ) {

    this._selectedCarriersTexts$.pipe().subscribe(texts => {
      this._existingTexts = texts.filter((t) => !t.isLost).sort((a, b) => a.sortInCar - b.sortInCar);
      this._firstTextId = this._existingTexts?.[0]?.id || '';
      this._lastTextId = this._existingTexts?.[this._existingTexts.length-1]?.id || '';
    });

    // subscribe to the selected page in the store and update the selected text
    this._selectedPage$.subscribe((page) => {
      if (!page || page == this._selectedPage) {
        return;
      }
      this._selectedPage = page;
      if (!this._existingTexts || !this._existingTexts.length) {
        // if the texts are not yet loaded, set the text to be initialized
        return;
      }
      this.setTextForPage(page);
    });
  }

  isInFirstText(): boolean {
    return !!this._selectedText && this._selectedText.id === this._firstTextId;
  }

  isInLastText(): boolean {
    return (
      !!this._selectedText &&
      this._selectedText.id === this._lastTextId
    );
  }

  jumpToText(text: CarrierText) {
    this._selectedText = text;
    this._store.dispatch(new UpdateSelectedCarrierText(text));
    const firstPageIdx = this.getFirstPageIdxOfText(text);
    this.goToPage(firstPageIdx);
  }

  goPrevText() {
    if (this.isInFirstText()) {
      return;
    }
    if (this._selectedText?.sortInCar) {
      this.goToText(this._selectedText.sortInCar - 1);
    } else {
      this.goPrevTextFromPage(this._selectedPage.id);
    }
  }

  goNextText() {
    if (this.isInLastText()) {
      return;
    }
    if (this._selectedText?.sortInCar !== undefined) {
      this.goToText(this._selectedText.sortInCar + 1);
    } else {
      this.goNextTextFromPage(this._selectedPage.id);
    }
  }

  goToText(idx: number) {
    const text = this._existingTexts.find((t) => t.sortInCar === idx);
    if (text) {
      this.jumpToText(text);
    } else {
      console.warn(`no text found at idx ${idx}`);
    }
  }

  // if there is a page selected, which has no text, the next text must be computed from following pages
  goNextTextFromPage(pageId: string) {
    this._store
      .select(SelectedCarrierPagesState)
      .pipe(take(1))
      .subscribe((pages: Page[]) => {
        let textIdToJump = '';
        let textToJump: CarrierText | undefined;

        const currentPageIdx = pages.findIndex((p) => p.id === pageId);
        if (currentPageIdx > -1) {
          textIdToJump = pages.filter(
            (p) => p.idx > pages[currentPageIdx].idx && p.textId
          )[0].textId;
        }
        if (textIdToJump) {
          textToJump = this._existingTexts.find((t) => t.id === textIdToJump);
        }
        if (textToJump) {
          this.jumpToText(textToJump);
        }
      });
  }

  // if there is a page selected, which has no text, the next text must be computed from following pages
  goPrevTextFromPage(pageId: string) {
    this._store
      .select(SelectedCarrierPagesState)
      .pipe(take(1))
      .subscribe((pages: Page[]) => {
        let textIdToJump: string | undefined = undefined;
        let textToJump: CarrierText | undefined;

        const currentPageIdx = pages.findIndex((p) => p.id === pageId);
        if (currentPageIdx > -1) {
          textIdToJump = pages
            .filter((p) => p.idx < pages[currentPageIdx].idx && p.textId)
            .pop()?.textId;
        }
        if (textIdToJump) {
          textToJump = this._existingTexts.find((t) => t.id === textIdToJump);
        }
        if (textToJump) {
          this.jumpToText(textToJump);
        }
      });
  }

  private getFirstPageIdxOfText(text: CarrierText): number {
    const carrierPages: Page[] = this._store.selectSnapshot(SelectedCarrierPagesState);
    if (!carrierPages || carrierPages.length === 0) {
      // we get the pages from the server
      console.warn('no carrier pages found in store');
    }

    let firstPage = carrierPages.find((p) => p.id === text.firstPageId);
    if (firstPage) {
      return firstPage.idx;
    }

    const pages = carrierPages
      .filter((p) => p.textId === text.id)
      .sort((a, b) => a.idx - b.idx);
    if (pages?.length) {
      firstPage = pages[0];
    } else {
      console.warn(`no page found for text ${text.id}`);
    }

    if (!firstPage) {
      const selectedPage = this._store.selectSnapshot(SelectedPageState);
      firstPage = selectedPage; // default
    }
    return firstPage?.idx || 0;
  }

  setTextForPage(page: Page) {
    if (page.textId && this._selectedText?.id === page.textId) {
      return; // text already selected
    }

    if (!page.textId) {
      this._selectedText = undefined;
      this._store.dispatch(new UpdateSelectedCarrierText(undefined)); // reset
      console.warn(`no text found for page ${page.label} with id ${page.id}`);
    }
    const t = this._existingTexts.find((t) => t.id == page.textId);
    if (t && t.id !== this._selectedText?.id) {
      // update text if text changed
      this._selectedText = t;

      // dispatch to Store
      this._store.dispatch(new UpdateSelectedCarrierText(t));
    }
  }

  private goToPage(idx: number) {
    const pages: Page[] = this._store.selectSnapshot(SelectedCarrierPagesState);
    const p = pages.find((p) => p.idx === idx);
    if (!p) {
      throw new Error(`no page with idx ${idx} found`);
    }
    this._store.dispatch(new UpdateSelectedPage(p));
  }
}



