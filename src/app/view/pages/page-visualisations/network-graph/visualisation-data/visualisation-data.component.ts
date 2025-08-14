import { Component } from '@angular/core';
import { VisualisationDataService } from '../visualisation-data.service';

@Component({
  selector: 'app-visualisation-data',
  templateUrl: './visualisation-data.component.html',
  styleUrl: './visualisation-data.component.scss',
})
export class VisualisationDataComponent {
  activeTabIndex = 0;

  constructor(private _visDataService: VisualisationDataService) {}

  onTabChange(tabIdx: number) {
    this.activeTabIndex = tabIdx;
    if (tabIdx === 0) {
      this._visDataService.setInteractionMode('select');
    }

    if (tabIdx === 1) {
      this._visDataService.setInteractionMode('info');
      return;
    }

    if (tabIdx === 2) {
      this._visDataService.setInteractionMode('report');
      return;
    }
  }
}
