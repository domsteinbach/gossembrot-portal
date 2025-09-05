import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit,
  Output,
  SimpleChanges, ViewChild,
} from '@angular/core';
import { DisplayVerweis } from '../../../model/verweis';
import { InformationCarrier } from '../../../model/infoCarrier';
import { CarrierText } from '../../../model/carriertext';
import { ScrollIntoViewDirective } from '../../../directives/scroll-into-view.directive';
import { Store } from '@ngxs/store';
import { SelectedVerweisState, UpdateSelectedVerweis } from '../../../state/belegstelle-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../../../routeConstants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-incoming-verweise-list',
  templateUrl: './incoming-verweise-list.component.html',
  styleUrls: ['./incoming-verweise-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomingVerweiseListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() texts: CarrierText[] = [];
  @Input() loading = false;
  @Input() forceSelectFirstVerweis? : object;

  @Input() infoCarrier: InformationCarrier | null = null; // Todo remove that and make proper structure
  @Input() displaySteckbrief = true; // Todo remove that and make proper structure

  @Output() verweisSelected = new EventEmitter<DisplayVerweis>();

  @ViewChild('scrollDirective') scrollDirective!: ScrollIntoViewDirective;

  selectedVerweis?: DisplayVerweis;
  _shouldForceSelect = false;

  private _verweisToInit: string | null | undefined = null;

  private _alreadyPrintedKartaMap = new Map<string, string>();
  private _alreadyPrintedAbschnittMap = new Map<string, string>();

  private _destroy$ = new Subject<void>();

  readonly INCOMING_PREFIX = 'incoming-';

  get hasIncomingVerweise() {
    return this.texts.flatMap(t => t.incomingVerweise).length > 0;
  }

  get selectedScrollTarget(): string {
    return this.selectedVerweis ? `${this.INCOMING_PREFIX}${this.selectedVerweis.id}` : '';
  }

  private _isPartOfIncomingVerweise(verweisId: string): boolean{
    const incomingVerweise = this.texts.flatMap(t => t.incomingVerweise);
    return incomingVerweise.some(v => v.id === verweisId);
  }

  constructor(
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
  ) {
  }

  ngOnInit() {
    this._verweisToInit = this._route.snapshot.queryParamMap.get(RouteConstants.QUERY_VERWEIS_PARAM)
    this._store.dispatch(new UpdateSelectedVerweis(null));
    this._store.select(SelectedVerweisState).pipe(takeUntil(this._destroy$)).subscribe((v: DisplayVerweis) => {
      if (!v) {
        return;
      }
      this._verweisToInit = v?.id;
      if (v && v.id !== this.selectedVerweis?.id && this._isPartOfIncomingVerweise(v.id)) {
        this._selectVerweis(v);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this._alreadyPrintedKartaMap = new Map<string, string>();

    if (changes['forceSelectFirstVerweis'] && this.forceSelectFirstVerweis) {
      this._shouldForceSelect = true;
    }

    if (changes['texts'] && this.texts.length && this.hasIncomingVerweise) {
      if (this._verweisToInit && this._isPartOfIncomingVerweise(this._verweisToInit)) {
        const verweisToInit = this.texts.flatMap(t => t.incomingVerweise).find(v => v.id === this._verweisToInit);
        if (verweisToInit) {
          this._verweisToInit = undefined;
          this._selectVerweis(verweisToInit);
        }
      } else {
        if (this._shouldForceSelect) {
          this._verweisToInit = undefined;
          this._shouldForceSelect = false;
          this.onVerweisClicked(this.texts[0].incomingVerweise[0]);
        }
        else if (!this._verweisToInit) {
          this._selectVerweis(this.texts[0].incomingVerweise[0]);
        }

      }
    }
  }

  closingAbschnitt(v: DisplayVerweis): boolean {
    if (!this._authService.isAuthenticated()) { // Todo: remove once approved
      return false;
    }
    if (v.targetBelegstelleObj?.abschnitt) {
      return false
    }
    const currentIndex = this.texts.flatMap(t => t.incomingVerweise).findIndex(ov => ov.id === v.id);
    if (currentIndex < 1) {
      return false;
    }
    const previousVerweis = this.texts.flatMap(t => t.incomingVerweise)[currentIndex - 1];
    return !!previousVerweis.targetBelegstelleObj?.abschnitt
  }

  displayAbschnitt(v: DisplayVerweis): boolean {
    if (!this._authService.isAuthenticated()) { // Todo: remove once approved
      return false;
    }
    if (!v.targetBelegstelleObj?.abschnitt) {
      return false;
    }
    const key = `${v.targetText}${v.targetBelegstelleObj.abschnitt}`;
    const printedBy = this._alreadyPrintedAbschnittMap.get(key);

    if (printedBy) { // only print for the page for that one abschnitt
      return printedBy === v.id;
    }
    this._alreadyPrintedAbschnittMap.set(key, v.id);
    return true;
  }

  displayKarta(v: DisplayVerweis): boolean {
    if (!v.targetBelegstelleObj?.belegstelleText) {
      return true;
    }
    const key = `${v.targetBlattangabe}${v.targetText}`;
    const printedBy = this._alreadyPrintedKartaMap.get(key);

    if (printedBy) { // only print for the page
      return printedBy === v.id;
    }
    this._alreadyPrintedKartaMap.set(key, v.id);
    return true;
  }

  onVerweisClicked(v: DisplayVerweis): void {
    this._selectVerweis(v);
    this._store.dispatch(new UpdateSelectedVerweis(v));
  }

  private _selectVerweis(v: DisplayVerweis): void {
    this.selectedVerweis = v;
    this.verweisSelected.emit(v);
    this._updateUrl();
    this._cdr.detectChanges();
    setTimeout(() => {
      this.scrollDirective.scrollToElement(this.selectedScrollTarget);
    }, 0);
  }

  private _updateUrl() {
    const queryParams = this.selectedVerweis ?
      { [RouteConstants.QUERY_VERWEIS_PARAM] : this.selectedVerweis.id } : null;

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
