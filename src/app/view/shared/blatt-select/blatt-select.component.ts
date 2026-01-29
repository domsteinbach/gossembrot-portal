import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Page } from "../../../model/page";
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { filter, map, Observable, startWith, Subject, tap } from "rxjs";
import { FormControl } from "@angular/forms";
import { Store } from "@ngxs/store";
import {
  SelectedPageState,
  UpdateSelectedPage,
} from "../../../state/app-state";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-blatt-select",
  templateUrl: "./blatt-select.component.html",
})
export class BlattSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() pages: Page[] = [];

  @ViewChild("pagesInput") pagesInput!: ElementRef;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild("auto") auto!: MatAutocomplete;

  pagesFormControl = new FormControl();
  filteredPages$!: Observable<Page[]>;
  firstFilteredPage: Page | undefined = undefined;

  private _selectedPage$: Observable<Page> =
    this._store.select(SelectedPageState);
  selectedPage?: Page;
  lastSelectedPage = "";

  private _destroy$ = new Subject<void>();

  constructor(private _store: Store) {}

  ngOnInit(): void {
    this.filteredPages$ = this.pagesFormControl.valueChanges.pipe(
      startWith(""),
      filter((value) => typeof value === "string"),
      map((value) => {
        const filteredOptions = this.filterPageOptions(value);
        return filteredOptions.sort((a, b) => a.idx - b.idx);
      }),
      tap((filtered) => {
        this.firstFilteredPage = filtered?.[0];
      }),
    );

    this._selectedPage$
      .pipe(takeUntil(this._destroy$))
      .subscribe((selectedPage: Page) => {
        if (
          selectedPage &&
          selectedPage.pageText !== this.selectedPage?.pageText &&
          this.pages.some((p) => p.pageText === selectedPage.pageText)
        ) {
          this.selectedPage = selectedPage;
          this.pagesFormControl.setValue(selectedPage.pageText);
        }
      });
  }

  ngOnChanges(): void {
    if (this.pages.length > 0) {
      this.pagesFormControl.reset();
      this.pages.sort((a, b) => b.idx - a.idx);
      const page = this._store.selectSnapshot(
        (SelectedPageState) => SelectedPageState.selectedPage,
      );
      if (page && this.pages.some((p) => p.pageText === page.pageText)) {
        this.selectedPage = page;
        this.pagesFormControl.setValue(page.pageText);
      }
      // sort them by sortincar
    } else {
      this.pagesFormControl.setValue("");
      this.selectedPage = undefined;
    }
  }

  filterPageOptions(value: string): Page[] {
    const filterValue = value.toLowerCase();
    return this.pages
      .filter((p) => p.pageText.toLowerCase().includes(filterValue))
      .sort((a, b) =>
        a.pageText.toLowerCase().startsWith(filterValue)
          ? -1
          : b.pageText.toLowerCase().startsWith(filterValue)
            ? 1
            : 0,
      );
  }

  onEnterPressed(event: Event): void {
    event.preventDefault();

    if (
      this.auto.isOpen &&
      !this.auto.options.some((o) => o.active) &&
      this.firstFilteredPage
    ) {
      this._store.dispatch(new UpdateSelectedPage(this.firstFilteredPage));
      this.autocompleteTrigger.closePanel();
      this.pagesInput.nativeElement.blur();
    }
  }

  onPageSelectionChange(page: Page): void {
    this._store.dispatch(new UpdateSelectedPage(page));
    this.autocompleteTrigger.closePanel();
  }

  onPageAutocompleteOpened(): void {
    this.lastSelectedPage = this.selectedPage?.pageText || "";
    this.pagesFormControl.setValue("");
    this.scrollToSelectedOption();
  }

  onPageAutocompleteClosed(): void {
    if (this.lastSelectedPage === this.selectedPage?.pageText || "") {
      // reset the old value of the page select
      this.pagesFormControl.setValue(this.selectedPage?.pageText || "");
    }
  }

  scrollToSelectedOption() {
    const selectedOption = this.auto.options.find((o) => o.selected);

    if (selectedOption) {
      selectedOption._getHostElement()?.scrollIntoView({
        block: "center",
      });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
