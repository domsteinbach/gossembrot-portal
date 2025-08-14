import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import {
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { Page } from '../../../model/page';

@Component({
  selector: 'app-belegstelle-select',
  templateUrl: './belegstelle-select.component.html',
  styleUrls: ['./belegstelle-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BelegstelleSelectComponent implements OnChanges {
  @Input() label!: string;
  @Input() pages: Page[] = [];

  @Output() pageSelected = new EventEmitter<Page>();

  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;

  @ViewChildren(MatOption) matOptions!: QueryList<MatOption>;

  pagesFormControl = new FormControl(); // autocomplete needs a FormControl

  filteredPages$!: Observable<Page[]>;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.filteredPages$ = this.pagesFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filteredOptions = this.filterOptions(value);
        return filteredOptions.sort((a, b) => a.idx - b.idx);
      })
    );
  }

  filterOptions(value: string): Page[] {
    const filterValue = value.toLowerCase();
    return this.pages.filter((p) =>
      p.pageText.toLowerCase().includes(filterValue)
    );
  }

  onBelegstelleAutocompleteOpened() {
    this.pagesFormControl.setValue('');
  }

  onBelegstelleSelectionChange(page: Page): void {
    this.pageSelected.emit(page);
    this.autocompleteTrigger.closePanel();
    this.matOptions.forEach((option) => option.deselect());
  }

  onBelegstelleAutocompleteClosed() {
    this.pagesFormControl.setValue('');
  }
}
