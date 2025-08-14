import { Component } from '@angular/core';
import { VerweisAdvancedFilterService } from '../verweis-advanced-filter.service';
import { BooleanControl } from '../../data-search-types';

@Component({
  selector: 'app-target-blatt-is-fragment-filter',
  template: `
    <mat-checkbox
      *ngFor="let t of isFragments"
      [checked]="isChecked(t)"
      (change)="onCheckboxChange($event, t)"
    >
      {{ t.label }}
    </mat-checkbox>
  `,
})
export class TargetBlattIsFragmentFilterComponent {
  isFragments: BooleanControl[] = [
    { checkboxValue: true, value: true, label: 'Komplette Zielblatt-Angaben' },
    {
      checkboxValue: true,
      value: false,
      label: 'Fregmentarische Zielblatt-Angaben',
    },
  ];

  selectedFilters: boolean[] = this.isFragments.map((t) => t.value);

  constructor(private filterService: VerweisAdvancedFilterService) {
    this.filterService.setTargetBlattIsFragmentFilter(this.selectedFilters);
  }

  isChecked(filter: BooleanControl): boolean {
    return (
      this.isFragments.filter((t) => t.label == filter.label && t.checkboxValue)
        .length > 0
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
    this.filterService.setTargetBlattIsFragmentFilter(this.selectedFilters);
  }
}
