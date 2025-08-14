import { Component } from '@angular/core';
import { BooleanControl } from '../../data-search-types';
import { VerweisAdvancedFilterService } from '../verweis-advanced-filter.service';
import { VerweisType } from '../../../../../model/verweis';

@Component({
  selector: 'app-is-nennung-filter',
  template: `
    <mat-checkbox
      *ngFor="let type of isNennungControls"
      [checked]="isChecked(type)"
      (change)="onCheckboxChange($event, type)"
    >
      {{ type.label }}
    </mat-checkbox>
  `,
})
export class IsNennungFilterComponent {
  isNennungControls: BooleanControl[] = [
    { checkboxValue: true, value: 'Verweis', label: 'Verweise' },
    {
      checkboxValue: true,
      value: 'Nennung',
      label: 'Nennungen ohne Verweis',
    },
  ];

  selectedFilters: VerweisType[] = this.isNennungControls.map((t) => t.value);

  constructor(private filterService: VerweisAdvancedFilterService) {
    this.filterService.setIsNennungFilter(this.selectedFilters);
  }

  isChecked(filter: BooleanControl): boolean {
    return (
      this.isNennungControls.filter(
        (t) => t.label == filter.label && t.checkboxValue
      ).length > 0
    );
  }

  onCheckboxChange(event: any, filter: BooleanControl) {
    if (event.checked) {
      this.selectedFilters.push(filter.value);
    } else {
      this.selectedFilters = this.selectedFilters.filter(
        (t) => t !== filter.value
      );
    }
    this.filterService.setIsNennungFilter(this.selectedFilters);
  }
}
