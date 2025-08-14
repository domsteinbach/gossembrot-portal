import { Component } from '@angular/core';
import { VerweisAdvancedFilterService } from '../verweis-advanced-filter.service';
import { BooleanControl } from '../../data-search-types';

@Component({
  selector: 'app-target-blatt-is-lost-filter',
  template: `
    <mat-checkbox
      *ngFor="let t of isLosts"
      [checked]="isChecked(t)"
      (change)="onCheckboxChange($event, t)"
    >
      {{ t.label }}
    </mat-checkbox>
  `,
})
export class TargetBlattIsLostFilterComponent {
  isLosts: BooleanControl[] = [
    { checkboxValue: true, value: true, label: 'Zielblatt ist erhalten' },
    {
      checkboxValue: true,
      value: false,
      label: 'Zielblatt ist verloren',
    },
  ];

  selectedFilters: boolean[] = this.isLosts.map((t) => t.value);

  constructor(private filterService: VerweisAdvancedFilterService) {
    this.filterService.setTargetBlattIsLostFilter(this.selectedFilters);
  }

  isChecked(filter: BooleanControl): boolean {
    return (
      this.isLosts.filter((t) => t.label == filter.label && t.checkboxValue)
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
    this.filterService.setTargetBlattIsLostFilter(this.selectedFilters);
  }
}
