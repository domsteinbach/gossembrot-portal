import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input, OnChanges, OnInit, SimpleChanges,
} from '@angular/core';
import { InformationCarrier } from '../../../model/infoCarrier';
import { take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../../../routeConstants';
import { Location } from '@angular/common';
import { DisplayVerweis } from '../../../model/verweis';
import { VerweisService } from '../../../service/verweis.service';
import { CarrierText } from '../../../model/carriertext';

@Component({
  selector: 'app-incoming-verweise',
  templateUrl: './incoming-verweise.component.html',
  styleUrls: ['./incoming-verweise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomingVerweiseComponent implements OnInit, OnChanges {

  @Input() carriers: InformationCarrier[] = [];
  @Input() label = '';
  @Input() withSubMenu = true;

  selectedCarrier: InformationCarrier | null = null;
  carrierToSelect: string | null = null;

  texts: CarrierText[] = [];

  selectedVerweis?: DisplayVerweis;

  forceSelectFirstVerweis?: object;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _location: Location,
    private _route: ActivatedRoute,
    private _router: Router,
    private _vs: VerweisService
  ) {}

  ngOnInit() {
    if (this._route.snapshot.paramMap.get(RouteConstants.INFO_CARRIER_PARAM)) {
      this.carrierToSelect = this._route.snapshot.paramMap.get(RouteConstants.INFO_CARRIER_PARAM) || '';
    }
  }

  ngOnChanges(changes:SimpleChanges): void {
    if (changes['carriers'] && !this.selectedCarrier && this.carriers.length > 0) {
      const carrierToSelect = this.carriers.find(c => c.id === this.carrierToSelect);
      if (carrierToSelect) {
        this.carrierToSelect = null;
        this.selectCarrier(carrierToSelect);
      } else {
        this.selectCarrier(this.carriers[0]);
      }
    }
  }

  selectCarrier(carrier: InformationCarrier): void {
    if (this.selectedCarrier === carrier || !carrier) {
      return;
    }
    this.selectedVerweis = undefined;
    this.forceSelectFirstVerweis = {};
    this.selectedCarrier = carrier;
    this._setCarrierParam(carrier.id);
    // Todo: move thatt to child! And use a nice combinelatest there! Gosh!
    this._vs.getTextsWithIncomingVerweise(this.selectedCarrier?.id || '')
      .pipe(take(1))
      .subscribe((texts) => {
        this.texts = texts;
        this._cdr.detectChanges();
      });
  }

  private _setCarrierParam(carId: string) {
    const path = this._location.path().split('/');
    if (path[1] === RouteConstants.RECONSTRUCTION) {
      const sub = path[2].split('?')[0];
      this._router.navigate([RouteConstants.RECONSTRUCTION, sub, carId], { queryParamsHandling: null });
    } else {
      this._router.navigate([path[1], carId], { queryParamsHandling: null });
    }
  }

  onVerweisSelected(verweis: DisplayVerweis) {
    this.selectedVerweis = verweis;
  }
}
