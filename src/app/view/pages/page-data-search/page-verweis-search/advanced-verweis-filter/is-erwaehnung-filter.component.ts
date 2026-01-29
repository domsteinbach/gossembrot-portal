import { Component } from "@angular/core";
import { BooleanControl } from "../../data-search-types";
import { VerweisAdvancedFilterService } from "../verweis-advanced-filter.service";
import { VerweisType } from "../../../../../model/verweis";

@Component({
  selector: "app-is-erwaehnung-filter",
  template: `
    <mat-checkbox
      matTooltip="Erwähnungen beziehen sich auf bloße Nennungen von Texten in rekonstruierbaren Textträgern, ohne spezifische Stellenangabe"
      *ngFor="let type of isErwaehnungControls"
      [checked]="isChecked(type)"
      (change)="onCheckboxChange($event, type)"
    >
      {{ type.label }}
    </mat-checkbox>
  `,
})
export class IsErwaehnungFilterComponent {
  isErwaehnungControls: BooleanControl[] = [
    { checkboxValue: true, value: "Verweis", label: "Verweise" },
    {
      checkboxValue: true,
      value: "Erwaehnung",
      label: "Erwähnung ohne Verweis",
    },
  ];

  selectedFilters: VerweisType[] = this.isErwaehnungControls.map(
    (t) => t.value,
  );

  constructor(private filterService: VerweisAdvancedFilterService) {
    this.filterService.setIsErwaehnungFilter(this.selectedFilters);
  }

  isChecked(filter: BooleanControl): boolean {
    return (
      this.isErwaehnungControls.filter(
        (t) => t.label == filter.label && t.checkboxValue,
      ).length > 0
    );
  }

  onCheckboxChange(event: any, filter: BooleanControl) {
    if (event.checked) {
      this.selectedFilters.push(filter.value);
    } else {
      this.selectedFilters = this.selectedFilters.filter(
        (t) => t !== filter.value,
      );
    }
    this.filterService.setIsErwaehnungFilter(this.selectedFilters);
  }
}
