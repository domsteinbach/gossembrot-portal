import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CarrierTextsState } from '../../../../../state/carriertext-state';
import {
  CarrierTextService,
} from '../../../../../service/carrier-text.service';
import { CarrierText } from '../../../../../model/carriertext';
import { MatSelect } from '@angular/material/select';
import {
  combineLatest,
  map,
  Observable,
  startWith,
  Subscription,
  tap,
} from 'rxjs';
import { Store } from '@ngxs/store';
import { SelectedCarrierTextState } from '../../../../../state/app-state';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';

@Component({
  selector: 'app-text-select',
  templateUrl: './text-select.component.html',
  styleUrls: ['./text-select.component.scss'],
})
export class TextSelectComponent implements OnInit, OnDestroy {
  carrierTexts$!: Observable<CarrierText[]>;
  selectedText$!: Observable<CarrierText>;

  textsSub!: Subscription;

  selectedText: CarrierText | undefined = undefined;
  lastSelectedText!: string;

  carrierTexts: CarrierText[] = [];

  textsFormControl = new FormControl(); // autocomplete needs a FormControl

  filteredTexts$!: Observable<CarrierText[]>; // populating the autocomplete input of pages
  firstFilteredText: CarrierText | undefined = undefined; // for make the first filtered carrier accessible to enter strokes

  // access the inputs for updating programmatically
  @ViewChild('textInput', { static: false }) textInput!: MatInput;
  @ViewChild('textInput', { static: false }) textInputRef!: ElementRef;
  @ViewChild('textAutoComplete', { static: false }) auto!: MatAutocomplete;

  // access the textSelect for updating the selected value
  @ViewChild('manTextSelect', { static: false }) manTextSelect!: MatSelect; // Todo: remove?
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private _store: Store,
    private _cdr: ChangeDetectorRef,
    private _carrierTextService: CarrierTextService
  ) {
    this.filteredTexts$ = this.textsFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTextOptions(value)),
      tap((texts) => {
        if (texts.length > 0) {
          this.firstFilteredText = texts[0];
        } else {
          this.firstFilteredText = undefined;
        }
      })
    );

    this.carrierTexts$ = this._store.select(CarrierTextsState.getSelectedCarriersTexts);
    this.selectedText$ = this._store.select(SelectedCarrierTextState);
  }

  ngOnInit(): void {
    this.textsSub = combineLatest([
      this.carrierTexts$,
      this.selectedText$,
    ]).subscribe(([carriertexts, selectedText]) => {
      this.carrierTexts = carriertexts;
      if (!selectedText || !carriertexts.some((c) => c.id == selectedText.id)) {
        this.textsFormControl.setValue('');
        this.lastSelectedText = '';
        this.selectedText = undefined;
      } else {
        this.selectedText = selectedText;
        this.textsFormControl.setValue(selectedText.fullTitle || '');
      }
        this._cdr.detectChanges();
    });
  }

  filterTextOptions(value: string): CarrierText[] {
    const filterValue = value.toLowerCase();
    return this.carrierTexts.filter((t) =>
      t.fullTitle.toLowerCase().includes(filterValue)
    );
  }

  onTextAutocompleteOpened() {
    this.lastSelectedText = this.selectedText?.fullTitle || '';
    // reset the selected value if the autocomplete gets opened to show all options
    this.textsFormControl.setValue('');
    this.scrollToSelectedOption();
  }

  scrollToSelectedOption() {
    this._cdr.detectChanges();
    const selectedOption = this.auto.options.find((o) => o.selected);

    if (selectedOption) {
      selectedOption._getHostElement()?.scrollIntoView({
        block: 'center',
      });
    }
  }

  onTextAutocompleteClosed() {
    // if no selection has been made
    if (
      this.selectedText &&
      this.lastSelectedText === this.selectedText.fullTitle
    ) {
      // reset the old value of the page select
      this.textsFormControl.setValue(this.selectedText.fullTitle);
    }
  }

  isInFirstText(): boolean {
    return this._carrierTextService.isInFirstText();
  }

  isInLastText() {
    return this._carrierTextService.isInLastText();
  }

  onPrevTextClick(): void {
    this._carrierTextService.goPrevText();
  }

  onNextTextClick(): void {
    this._carrierTextService.goNextText();
  }

  onTextSelectChange(text: CarrierText): void {
    this._carrierTextService.jumpToText(text);
    this.autocompleteTrigger.closePanel();
  }

  // Select whatever text is first of the filtered options.
  onEnterPressed(event: Event): void {
    // Prevent the default enter behavior if necessary
    event.preventDefault();
    // Check if the autocomplete panel is open and if no option is focused
    if (
      this.auto.isOpen &&
      !this.auto.options.some((option) => option.active) &&
      this.firstFilteredText
    ) {
      this.onTextSelectChange(this.firstFilteredText);
      // Close the autocomplete panel
      this.autocompleteTrigger.closePanel();
      // Unfocus the input element
      this.textInputRef.nativeElement.blur();
    }
  }

  ngOnDestroy(): void {
    this.textsSub.unsubscribe();
  }
}
