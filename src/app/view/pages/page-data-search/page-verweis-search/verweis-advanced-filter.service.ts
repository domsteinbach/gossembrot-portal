import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayVerweis, VerweisType } from '../../../../model/verweis';
import { map } from 'rxjs/operators';
import { InfoCarrierType, Physicality } from '../../../../model/infoCarrier';

@Injectable({
  providedIn: 'root',
})
export class VerweisAdvancedFilterService {
  private _targetPhysicalityFilter = new BehaviorSubject<Physicality[]>([]);
  private _targetInfoCarrierTypeFilter = new BehaviorSubject<InfoCarrierType[]>(
    []
  );
  private _targetBlattIsFragmentFilter = new BehaviorSubject<boolean[]>([]);
  private _isNennungFilter = new BehaviorSubject<VerweisType[]>([]);
  private _targetBlattIsLostFilter = new BehaviorSubject<boolean[]>([]);

  get targetPhysicalityFilter$(): Observable<Physicality[]> {
    return this._targetPhysicalityFilter.asObservable();
  }

  setTargetPhysicalityFilter(filters: Physicality[]) {
    this._targetPhysicalityFilter.next(filters);
  }

  get targetInfoCarrierTypeFilter$(): Observable<InfoCarrierType[]> {
    return this._targetInfoCarrierTypeFilter.asObservable();
  }

  setTargetInfoCarrierTypeFilter(filters: InfoCarrierType[]) {
    this._targetInfoCarrierTypeFilter.next(filters);
  }

  get targetBlattIsFragmentFilter$(): Observable<boolean[]> {
    return this._targetBlattIsFragmentFilter.asObservable();
  }

  setTargetBlattIsFragmentFilter(filters: boolean[]) {
    this._targetBlattIsFragmentFilter.next(filters);
  }

  get isNennungFilter$(): Observable<VerweisType[]> {
    return this._isNennungFilter.asObservable();
  }

  setIsNennungFilter(filters: VerweisType[]) {
    this._isNennungFilter.next(filters);
  }

  get targetBlattIsLostFilter$(): Observable<boolean[]> {
    return this._targetBlattIsLostFilter.asObservable();
  }

  setTargetBlattIsLostFilter(filters: boolean[]) {
    this._targetBlattIsLostFilter.next(filters);
  }

  applyFilters(
    verweise$: Observable<DisplayVerweis[]>
  ): Observable<DisplayVerweis[]> {
    return verweise$.pipe(
      map((verweise: DisplayVerweis[]) =>
        verweise
          .filter((verweis: DisplayVerweis) =>
            this._filterByPhysicality(verweis)
          )
          .filter((verweis: DisplayVerweis) =>
            this._filterByInfoCarrierType(verweis)
          )
          .filter((verweis: DisplayVerweis) =>
            this._filterByTargetBlattIsFragment(verweis)
          )
          .filter((verweis: DisplayVerweis) =>
            this._filterByIsNennung(verweis)
          )
          .filter((verweis: DisplayVerweis) =>
            this._filterByTargetBlattIsLost(verweis)
          )
      )
    );
  }

  private _filterByPhysicality(verweis: DisplayVerweis): boolean {
    const activeFilters = this._targetPhysicalityFilter.getValue();
    return (
      activeFilters.length === 0 ||
      activeFilters.includes(verweis.targetCarPhysicality as Physicality)
    );
  }

  private _filterByInfoCarrierType(verweis: DisplayVerweis): boolean {
    const activeFilters = this._targetInfoCarrierTypeFilter.getValue();
    return (
      activeFilters.length === 0 ||
      activeFilters.includes(
        verweis.targetCarObj?.carrierType as InfoCarrierType
      )
    );
  }

  private _filterByTargetBlattIsFragment(verweis: DisplayVerweis): boolean {
    // Todo: fix this
    const activeFilters = this._targetBlattIsFragmentFilter.getValue();
    return activeFilters.some(
      (filter: boolean) => verweis.targetBlattIsFragment !== filter
    );
  }

  private _filterByTargetBlattIsLost(verweis: DisplayVerweis): boolean {
    const activeFilters = this._targetBlattIsLostFilter.getValue();
    return activeFilters.some(
      (filter: boolean) => verweis.targetBelegstelleObj?.lost !== filter
    );
  }

  private _filterByIsNennung(verweis: DisplayVerweis): boolean {
    const activeFilters = this._isNennungFilter.getValue();
    return activeFilters.some((filter) => filter === verweis.type);
  }
}
