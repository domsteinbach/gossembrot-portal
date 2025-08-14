import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { VisualisationVerweis } from '../../../../model/visualisations';
import { Observable } from 'rxjs';
import { VisualizationRepository } from '../../../../data/repository/visualization-repository';

@Component({
  selector: 'app-directed-chord',
  templateUrl: './directed-chord.component.html',
  styleUrls: ['./directed-chord.component.scss'],
})
export class DirectedChordComponent {
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

  @Input() carriers: VisualisationVerweis[] | null = [];

  carrierToCarrierVerweise$: Observable<VisualisationVerweis[]> =
    this._vr.getCarrierToCarrierVerweise();

  constructor(private _vr: VisualizationRepository) {
    this.carrierToCarrierVerweise$.subscribe((data) => {
      this.carriers = data;
    });
  }
}
