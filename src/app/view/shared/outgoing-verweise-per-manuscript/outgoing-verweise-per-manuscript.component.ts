import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  BehaviorSubject,
  map,
  take,
} from 'rxjs';
import { VerweisService } from '../../../service/verweis.service';
import { DisplayCarrierText } from '../../../model/carriertext';
import { AuthService } from '../../../auth/auth.service';
import { RouteConstants } from '../../../routeConstants';
import { ActivatedRoute, Router } from '@angular/router';
import { DisplayVerweis } from '../../../model/verweis';
import { InformationCarrier } from '../../../model/infoCarrier';
import { Store } from '@ngxs/store';
import { UpdateSelectedVerweis } from '../../../state/belegstelle-state.service';

@Component({
  selector: 'app-outgoing-verweise-per-manuscript',
  templateUrl: './outgoing-verweise-per-manuscript.component.html',
  styles: [`
      .outgoing-verweise-per-manuscript {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

    .scroll-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }

      .header-line {
        display: flex;
        flex-direction: row;
        align-items: center;
        // space between
        justify-content: space-between;
      }

      .subtitle {
        color: var(--title-color);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutgoingVerweisePerManuscriptComponent implements OnChanges {
  @Input() selectedCarrier: InformationCarrier | null = null;
  @Input() displaySteckbrief= true;
  @Input() forceSelectFirstVerweis?: object;
  _shouldForceSelect = false;

  texts: DisplayCarrierText[] = [];

  loading = false;

  private _includeNennungen = new BehaviorSubject<boolean>(false);
  includeNennungen$ = this._includeNennungen.asObservable();

  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  constructor(
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _verweisService: VerweisService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['forceSelectFirstVerweis'] && this.forceSelectFirstVerweis) {
      this._shouldForceSelect = true;
    }
    if (changes['selectedCarrier'] && this.selectedCarrier) {
      this.loading = true;
      this._getTextsWithOutgoingVerweise$(this.selectedCarrier.id, this._includeNennungen.value)
        .pipe(take(1))
        .subscribe(texts => {
          this.texts = texts;
          this.loading = false;
          if (this._shouldForceSelect && texts.length > 0) {
            this.onVerweisSelected(texts[0].outgoingVerweise[0]);
            this._shouldForceSelect = false;
            this._store.dispatch(new UpdateSelectedVerweis(texts[0].outgoingVerweise[0]));
          }
          this._cdr.detectChanges();
        });
    }
  }

  onVerweisSelected(verweis: DisplayVerweis) {
    const queryParams = this._authService.isAuthenticated() ?
      { [RouteConstants.QUERY_VERWEIS_PARAM] : verweis.id } : null;

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
    });
  }

  private _getTextsWithOutgoingVerweise$(
    carrierId: string,
    includeNennungen: boolean
  ) {
    return this._verweisService
      .getTextsWithOutgoingVerweiseOfCarrier$(
        carrierId,
        true,
        includeNennungen
      )
      .pipe(
        map((texts: DisplayCarrierText[]) => {
          const filtered = texts.filter((t) => t.outgoingVerweise.length > 0);
          filtered.sort((a, b) => a.sortInCar - b.sortInCar);
          filtered.forEach((t) => {
            t.outgoingVerweise.sort((a, b) => a.sortInSourceCarrier - b.sortInSourceCarrier);
          });
          return filtered;
        })
      )
      ;
  }

  onIncludeNennungenChange(includeNennungen: boolean): void {
    this._includeNennungen.next(includeNennungen);
  }
}
