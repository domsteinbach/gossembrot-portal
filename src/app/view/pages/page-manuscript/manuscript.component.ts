import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject, take } from "rxjs";
import { InformationCarrier } from "../../../model/infoCarrier";
import {
  CarriersState,
  SelectedSrcInformationCarrierState,
  UpdateSelectedSrcInformationCarrier,
} from "../../../state/information-carrier-state.service";
import { Store } from "@ngxs/store";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { RouteConstants } from "../../../routeConstants";
import { UpdateSelectedPage } from "../../../state/app-state";
import { SelectedVerweisState } from "../../../state/belegstelle-state.service";
import { filter, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-manuscript",
  templateUrl: "./manuscript.component.html",
  styleUrls: ["./manuscript.component.scss"],
})
export class ManuscriptComponent implements OnInit, OnDestroy {
  existingCarriers$ = this._store.select(CarriersState.existingManuscripts);
  selectedCarrier$: Observable<InformationCarrier> = this._store.select(
    SelectedSrcInformationCarrierState,
  );

  selectedVerweis$ = this._store.select(SelectedVerweisState);

  private _destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
    private _router: Router,
  ) {}

  ngOnInit() {
    this.selectedVerweis$
      .pipe(filter(Boolean), takeUntil(this._destroy$))
      .subscribe((v) => {
        this._store.dispatch(
          new UpdateSelectedPage(v?.srcBelegstelleObj?.page),
        );
      });

    this._initializeSourceCarrierFromParams(
      this._route.firstChild?.snapshot.paramMap,
      this._route.snapshot.queryParamMap,
    );
  }

  private _initializeSourceCarrierFromParams(
    paramMap?: ParamMap,
    queryParamMap?: ParamMap,
  ): void {
    this._store
      .select(CarriersState.existingManuscripts)
      .pipe(
        filter((carriers) => carriers.length > 0),
        take(1),
      )
      .subscribe((carriers) => {
        this._initCarrierFromParams(carriers, paramMap, queryParamMap);
      });
  }

  private _initCarrierFromParams(
    carriers: InformationCarrier[],
    paramMap?: ParamMap,
    queryParamMap?: ParamMap,
  ): void {
    const carParam = paramMap?.get(RouteConstants.INFO_CARRIER_PARAM);
    const pageParam =
      queryParamMap?.get(RouteConstants.QUERY_PAGE_PARAM) || undefined;
    const carrierTextParam =
      queryParamMap?.get(RouteConstants.QUERY_CARRIERTEXT_PARAM) || undefined;
    const selectedCarrier =
      carriers.find((c) => c.id === carParam) || carriers[0];
    if (!carParam) {
      // set the param
      this._router.navigate([RouteConstants.MANUSCRIPTS, selectedCarrier.id], {
        queryParamsHandling: "merge",
      });
    }
    this._store.dispatch(
      new UpdateSelectedSrcInformationCarrier(
        selectedCarrier,
        pageParam,
        carrierTextParam,
      ),
    );
  }

  onManuscriptSelectionChange(carrier: InformationCarrier): void {
    this._router.navigate([RouteConstants.MANUSCRIPTS, carrier.id]);
    this._store.dispatch(new UpdateSelectedSrcInformationCarrier(carrier));
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
