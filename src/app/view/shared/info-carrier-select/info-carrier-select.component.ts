import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import {map, Observable, startWith, tap} from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import { InformationCarrier } from '../../../model/infoCarrier';

@Component({
  selector: 'app-info-carrier-select',
  templateUrl: './info-carrier-select.component.html',
  styleUrls: ['./info-carrier-select.component.scss'],
})
export class InfoCarrierSelectComponent implements OnChanges {
  @Input() carriers: InformationCarrier[] = [];
  @Input() label = '';
  @Input() selectedCarrier?: InformationCarrier | null;

  @Output() carrierSelected!: EventEmitter<InformationCarrier>;

  lastSelectedCarrier!: string | undefined;

  carrierFormControl = new FormControl(); // autocomplete needs a FormControl

  autoFilteredCarriers$!: Observable<InformationCarrier[]>; // the autocomplete filtered carriers

  firstFilteredCarrier: InformationCarrier | undefined = undefined; // store the first filtered carrier for onEnterPressed can access it

  // access the inputs for updating programmatically
  @ViewChild('carrierInput', { static: false }) carrierInput!: MatInput;
  @ViewChild('carrierInput') carrierInputRef!: ElementRef;
  @ViewChild('carrierAutoComplete', {static: false}) carrierAutoComplete!:MatAutocomplete;
  // access the textSelect for updating the selected value
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(private _cdr: ChangeDetectorRef) {
    this.autoFilteredCarriers$ = this.carrierFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterCarrierOptions(value)),
        tap(filteredCarriers => {
          if (filteredCarriers && filteredCarriers.length > 0) {
            this.firstFilteredCarrier = filteredCarriers[0];
          } else {
            this.firstFilteredCarrier = undefined;
          }
        })
    );

    this.carrierSelected = new EventEmitter<InformationCarrier>();
  }

  ngOnChanges() {
    if (this.carriers.length > 1) {
      // Sort the carriers by sort_arg, which makes sure that carriers with the same shelfmark/Signatur
      // are sorted by the Signaturs Prefixes/Letters and the numbers are sorted as numbers
      this.carriers = this.carriers.sort(
        (a: InformationCarrier, b: InformationCarrier) => {
          if (a.sort_arg < b.sort_arg) {
            return -1;
          }
          if (a.sort_arg > b.sort_arg) {
            return 1;
          }
          return 0;
        }
      );
    }
    if (!this.selectedCarrier) {
      this.carrierFormControl.setValue('');
      return;
    } else {
      this.carrierFormControl.setValue(this.selectedCarrier.fullTitle);
    }
    this._cdr.detectChanges();
  }

  filterCarrierOptions(value: string): InformationCarrier[] {
    if (!this.carriers) {
      return [];
    }
    if (!value) {
      return this.carriers;
    }
    const filterValue = value.toLowerCase();

    // First, filter the carriers
    const filteredCarriers = this.carriers.filter((c) =>
      c.fullTitle.toLowerCase().includes(filterValue)
    );

    // sort the filtered carriers:
    // Carriers with fullTitle starting with filterValue will come first
    filteredCarriers.sort((a, b) => {
      const aStartsWith = a.fullTitle.toLowerCase().startsWith(filterValue);
      const bStartsWith = b.fullTitle.toLowerCase().startsWith(filterValue);

      if (aStartsWith && !bStartsWith) {
        return -1; // a comes first
      }
      if (!aStartsWith && bStartsWith) {
        return 1; // b comes first
      }
      return 0; // original order for others
    });

    return filteredCarriers;
  }

  onCarrierAutocompleteOpened() {
    this.lastSelectedCarrier = this.selectedCarrier?.fullTitle;
    // reset the selected value if the autocomplete gets opened to show all options
    this.carrierFormControl.setValue('');
    this.scrollToSelectedOption();
  }

  scrollToSelectedOption() {
    this._cdr.detectChanges();
    const selectedOption = this.carrierAutoComplete.options.find(o => o.selected);

    if (selectedOption) {
      selectedOption._getHostElement()?.scrollIntoView({
        block: 'center',
      });
    }
  }

  onCarrierAutocompleteClosed() {
    // if no selection has been made or the selection is the same as before, reset the value
    if (this.lastSelectedCarrier === this.selectedCarrier?.fullTitle) {
      // reset the old value of the page select
      this.carrierFormControl.setValue(this.lastSelectedCarrier);
    }
  }

  // Select whatever page is first of the filtered options.
  onEnterPressed(event: Event): void {
    // Prevent the default enter behavior if necessary
    event.preventDefault();

    // Check if the autocomplete panel is open and if no option is focused
    if (this.carrierAutoComplete.isOpen && !this.carrierAutoComplete.options.some(option => option.active) && this.firstFilteredCarrier) {
            this.onCarrierSelectChange(this.firstFilteredCarrier);
            // Close the autocomplete panel
            this.autocompleteTrigger.closePanel();
            // Unfocus the input element
            this.carrierInputRef.nativeElement.blur();
    }
  }


  onCarrierSelectChange(carrier: InformationCarrier) {
    this.selectedCarrier = carrier;
    this.autocompleteTrigger.closePanel(); // close the autocomplete panel
    this.carrierSelected.emit(carrier);
  }
}
