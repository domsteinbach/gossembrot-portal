import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  CarriersState
} from '../../../state/information-carrier-state.service';
import { InformationCarrier } from '../../../model/infoCarrier';
import {map, Subject, combineLatest, filter, take} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { VerweisSynopsisService } from './verweis-synopsis.service';
import {first } from 'rxjs/operators';
import { RouteConstants } from '../../../routeConstants';
import { VerweisRepository } from '../../../data/repository/verweis-repository';

@Component({
  selector: 'app-verweis-synopsis',
  standalone: false,
  templateUrl: './verweis-synopsis.component.html',
  styleUrl: './verweis-synopsis.component.scss',
  providers: [VerweisSynopsisService], // Provide service here

})
export class VerweisSynopsisComponent implements OnInit, OnDestroy {

  srcCarriers$ = this._store.select(CarriersState.existingManuscripts).pipe(
    filter(carriers => carriers.length > 0),
    map(carriers => carriers.filter(c => c.hasOutgoingVerweis))
  );
  selectedSrcCarrier$ = this._vvs.selectedSrcCarrier$;
  srcPage$ = this._vvs.srcPage$;


  targetCarriers$ = this._store.select(CarriersState)
    .pipe(
      filter(carriers => carriers.length > 0),
      map(filter => filter.filter((carrier: InformationCarrier) => carrier.hasIncomingVerweis)));
  targetCarrier$ = this._vvs.targetCarrier$;
  targetTexts$ = this._vvs.targetTexts$;

  targetTextsLoading$ = this._vvs.targetTextsLoading$;

  targetPage$ = this._vvs.targetPage$;

  forceSelectFirstSrcVerweis: object | undefined = undefined;
  forceSelectFirstTargetVerweis: object | undefined = undefined;

  private _destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _vr: VerweisRepository,
    private _vvs: VerweisSynopsisService) {
  }

  ngOnInit() {

    const verweisToInit = this._route.snapshot.queryParamMap.get(RouteConstants.QUERY_VERWEIS_PARAM);

    if (verweisToInit) {
      combineLatest([this.srcCarriers$, this._vr.getVerweisById$(verweisToInit)]).pipe(
        first( ([carriers, verweis]) => carriers.length > 0 && !!verweis, [])
      ).subscribe(([carriers, verweis]) => {
        const srcCarrier = carriers.find(c => c.id === verweis?.srcCar);
        if (srcCarrier) {
          this._vvs.selectSrcCarrier(srcCarrier);
        }
      });
    } else {
      this._vvs.unSetDisplayedPages()
      this.srcCarriers$.subscribe(
        carriers => {
          this.forceSelectFirstSrcVerweis = {};
          const carrierToInit = carriers.find(c => c.id === verweisToInit);
          if (carrierToInit) {
            this._vvs.selectSrcCarrier(carrierToInit);
          } else {
            this._vvs.selectSrcCarrier(carriers[0]);
          }
        }
      );
    }
  }

  onSrcManuscriptSelectionChange(carrier: InformationCarrier): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {}
    });
    this.forceSelectFirstSrcVerweis = {};
    this._vvs.selectSrcCarrier(carrier);
  }

  onTargetManuscriptSelectionChange(carrier: InformationCarrier): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {}
    });
    this.forceSelectFirstTargetVerweis = {};
    this._vvs.selectTargetCarrier(carrier);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
