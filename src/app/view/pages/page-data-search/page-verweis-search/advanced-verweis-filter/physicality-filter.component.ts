import { Physicality } from "../../../../../model/infoCarrier";
import { VerweisAdvancedFilterService } from "../verweis-advanced-filter.service";
import { Component } from "@angular/core";
import { PhysicalityControl } from "./control-types";

@Component({
  selector: "app-physicality-filter",
  template: `
    <mat-checkbox
      *ngFor="let type of physicalityTypes"
      [checked]="isChecked(type.physicality)"
      (change)="onCheckboxChange($event, type.physicality)"
    >
      {{ type.label }}
    </mat-checkbox>
  `,
})
export class PhysicalityFilterComponent {
  physicalityTypes: PhysicalityControl[] = [
    { physicality: "Available", label: "Erhalten" },
    { physicality: "Lost", label: "Verschollen" },
    { physicality: "Classic", label: "Kanonische Texte" },
  ];
  selectedFilters: Physicality[] = ["Available", "Lost", "Classic"];

  constructor(private filterService: VerweisAdvancedFilterService) {}

  isChecked(type: Physicality): boolean {
    return this.selectedFilters.includes(type);
  }

  onCheckboxChange(event: any, type: Physicality) {
    if (event.checked) {
      this.selectedFilters.push(type);
    } else {
      this.selectedFilters = this.selectedFilters.filter((t) => t !== type);
    }
    this.filterService.setTargetPhysicalityFilter(this.selectedFilters);
  }
}
