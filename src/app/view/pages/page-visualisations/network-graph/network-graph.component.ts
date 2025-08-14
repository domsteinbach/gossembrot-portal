import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { VisualisationDataService } from './visualisation-data.service';
import { CarrierTextRepository } from '../../../../data/repository/carrier-text-repository';
import {
  Granularity,
  VisualisationSettingsService,
} from './visualisation-settings.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrl: './network-graph.component.scss',
})
export class NetworkGraphComponent implements OnInit, OnDestroy {
  nodes: any[] = [];
  links: any[] = [];
  granularity: Granularity = 'InformationCarrier';

  destroy$ = new Subject<void>();

  constructor(
    private _visService: VisualisationDataService,
    private _visSettings: VisualisationSettingsService
  ) {}

  ngOnInit() {
    combineLatest([
      this._visService.visualisedNodes$,
      this._visService.visualisedLinks$,
      this._visSettings.granularity$,
    ])
      .pipe(takeUntil(this.destroy$))

      .subscribe(([nodes, links, granularity]) => {
        this.nodes = [...nodes];
        this.links = [...links];
        this.granularity = granularity;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
