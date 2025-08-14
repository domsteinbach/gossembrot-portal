import { Injectable, OnDestroy } from '@angular/core';
import { DisplayVerweis } from '../../../model/verweis';
import { Store } from '@ngxs/store';
import { InformationCarrier } from '../../../model/infoCarrier';
import { BehaviorSubject, distinctUntilChanged, filter, Observable, Subject, switchMap, tap } from 'rxjs';
import {
  SelectedVerweisState,
  UpdateSelectedVerweis,
} from '../../../state/belegstelle-state.service';
import { takeUntil } from 'rxjs/operators';
import { PageOfMissingCarrier, NullPage, Page } from '../../../model/page';
import { VerweisService } from '../../../service/verweis.service';

@Injectable()
export class VerweisSynopsisService implements OnDestroy {

  private _selectedVerweisId = ''

  private _srcCarrier = new BehaviorSubject<InformationCarrier | null>(null);
  selectedSrcCarrier$ = this._srcCarrier.asObservable();

  private _srcPage = new BehaviorSubject<Page | undefined>(undefined);
  srcPage$ = this._srcPage.asObservable();

  private _targetCarrier = new BehaviorSubject<InformationCarrier | undefined>(undefined);
  targetCarrier$ = this._targetCarrier.asObservable();

  private _targetTextsLoading = new BehaviorSubject<boolean>(false);
  targetTextsLoading$ = this._targetTextsLoading.asObservable();

  targetTexts$ = this.targetCarrier$.pipe(
    filter((carrier): carrier is InformationCarrier => !!carrier),
    switchMap(carrier => {
      this._targetTextsLoading.next(true);
      return this._vs.getTextsWithIncomingVerweise(carrier.id).pipe(
        tap(() => this._targetTextsLoading.next(false))
      );
    })
  );

  private _targetPage = new BehaviorSubject<Page| undefined>(undefined);
  targetPage$: Observable<Page | undefined> = this._targetPage.asObservable().pipe(distinctUntilChanged());

  private _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _vs: VerweisService,
  ) {
    this._store.dispatch(new UpdateSelectedVerweis(null));

    this._store.select(SelectedVerweisState).pipe(takeUntil(this._destroy$)).subscribe( (verweis: DisplayVerweis) => {
      if (!verweis || verweis.id === this._selectedVerweisId) {
        return;
      }
      this._selectedVerweisId = verweis.id;
      this._srcPage.next(verweis.srcBelegstelleObj?.page);

      const targetPage = verweis.targetCarObj?.physicality === 'Available' ? verweis.targetBelegstelleObj?.getPageOrAlternativePage() : new PageOfMissingCarrier()
      this._targetPage.next(targetPage);

      if (verweis.srcCarObj && verweis.srcCar !== this._srcCarrier.value?.id) {
        this._srcCarrier.next(verweis.srcCarObj);
      }

      if (verweis.targetCarObj && verweis.targetCar !== this._targetCarrier.value?.id) {
        this._targetCarrier.next(verweis.targetCarObj);
      }
    });
  }

  selectSrcCarrier(carrier: InformationCarrier) {
    if (this._srcCarrier.value?.id === carrier.id) {
      return;
    }
    this._srcCarrier.next(carrier);
    this.unSetDisplayedPages();
  }

  selectTargetCarrier(carrier: InformationCarrier) {
    if (this._targetCarrier.value?.id === carrier.id) {
      return;
    }
    this._targetCarrier.next(carrier);
    this.unSetDisplayedPages();
  }

  unSetDisplayedPages() {
    this._srcPage.next(new NullPage());
    this._targetPage.next(new NullPage());
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
