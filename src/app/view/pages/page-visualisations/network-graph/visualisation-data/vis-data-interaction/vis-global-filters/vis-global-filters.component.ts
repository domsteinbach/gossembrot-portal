import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionPanelTitle } from '@angular/material/expansion';
import {
  InfoCarrierType,
  Physicality,
} from '../../../../../../../model/infoCarrier';
import { FormsModule } from '@angular/forms';
import { VisualisationSettingsService } from '../../../visualisation-settings.service';
import { Subscription } from 'rxjs';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatDivider } from '@angular/material/divider';
import { MatLabel } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';

export interface VisGlobalFilter {
  inGsmbBib: boolean[];
  infoCarrierTypes: InfoCarrierType[];
  physicalities: Physicality[];
  includeConnected: boolean;
}

@Component({
  selector: 'app-vis-global-filters',
  standalone: true,
  imports: [
    MatCheckbox,
    MatExpansionPanelTitle,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDivider,
    MatLabel,
    MatTooltip,
  ],
  templateUrl: './vis-global-filters.component.html',
  styleUrl: './vis-global-filters.component.scss',
})
export class VisGlobalFiltersComponent implements OnDestroy {
  private _settingsSub: Subscription;
  filter!: VisGlobalFilter;

  constructor(
    private _crd: ChangeDetectorRef,
    private _visSettingsService: VisualisationSettingsService
  ) {
    this._settingsSub = this._visSettingsService.globalFilter$.subscribe(
      (f) => {
        this.filter = f;
      }
    );
  }

  // Update library presence
  toggleLibraryPresence(value: boolean, checked: boolean) {
    const index = this.filter.inGsmbBib.indexOf(value);
    if (checked && index === -1) {
      this.filter.inGsmbBib.push(value);
    } else if (!checked && index !== -1) {
      this.filter.inGsmbBib.splice(index, 1);
    }
    this._visSettingsService.globalFilter = this.filter;
  }

  // Update info carrier type
  toggleInfoCarrierType(type: InfoCarrierType, checked: boolean) {
    const index = this.filter.infoCarrierTypes.indexOf(type);
    if (checked && index === -1) {
      this.filter.infoCarrierTypes.push(type);
    } else if (!checked && index !== -1) {
      this.filter.infoCarrierTypes.splice(index, 1);
    }
    this._visSettingsService.globalFilter = this.filter;
  }

  // Update physicality
  togglePhysicality(type: Physicality, checked: boolean) {
    const index = this.filter.physicalities.indexOf(type);
    if (checked && index === -1) {
      this.filter.physicalities.push(type);
    } else if (!checked && index !== -1) {
      this.filter.physicalities.splice(index, 1);
    }
    this._visSettingsService.globalFilter = this.filter;
  }

  // Helper methods to check if a value is selected
  isLibrarySelected(value: boolean): boolean {
    return this.filter.inGsmbBib.includes(value);
  }

  isInfoCarrierTypeSelected(type: InfoCarrierType): boolean {
    return this.filter.infoCarrierTypes.includes(type);
  }

  isPhysicalitySelected(type: Physicality): boolean {
    return this.filter.physicalities.includes(type);
  }

  applyScopeChange(change: MatRadioChange) {
    this.filter.includeConnected = change.value;
    this._visSettingsService.globalFilter = this.filter;
  }

  ngOnDestroy() {
    this._settingsSub.unsubscribe();
  }
}
