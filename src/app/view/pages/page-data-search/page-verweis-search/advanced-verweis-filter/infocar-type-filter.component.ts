import { Component } from '@angular/core';
import { InfoCarrierType } from '../../../../../model/infoCarrier';
import { VerweisAdvancedFilterService } from '../verweis-advanced-filter.service';

interface InfoCarrierTypeControl {
  infocarType: InfoCarrierType;
  label: string;
}

@Component({
  selector: 'app-infocar-type-filter',
  template: `
    <mat-checkbox
      *ngFor="let type of infoCarrierTypes"
      [checked]="isChecked(type.infocarType)"
      (change)="onCheckboxChange($event, type.infocarType)"
    >
      {{ type.label }}
    </mat-checkbox>
  `,
})
export class InfocarTypeFilterComponent {
  infoCarrierTypes: InfoCarrierTypeControl[] = [
    { infocarType: 'Manuscript', label: 'Handschriften' },
    { infocarType: 'Print', label: 'Drucke' },
    { infocarType: 'Classic', label: 'Kanonische Texte' },
  ];
  constructor(private filterService: VerweisAdvancedFilterService) {}

  selectedFilters: InfoCarrierType[] = ['Manuscript', 'Print', 'Classic'];

  isChecked(type: InfoCarrierType): boolean {
    return this.selectedFilters.includes(type);
  }

  onCheckboxChange(event: any, type: InfoCarrierType) {
    if (event.checked) {
      this.selectedFilters.push(type);
    } else {
      this.selectedFilters = this.selectedFilters.filter((t) => t !== type);
    }
    this.filterService.setTargetInfoCarrierTypeFilter(this.selectedFilters);
  }
}
