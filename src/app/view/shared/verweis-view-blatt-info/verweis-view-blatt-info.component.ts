import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Page } from '../../../model/page';
import { SelectedThemeState } from '../../../state/theme-state';
import { map, Subject } from 'rxjs';
import { GsmbTheme } from '../../../model/theme';
import { Store } from '@ngxs/store';
import { DisplayVerweis } from '../../../model/verweis';
import { SelectedVerweisState } from '../../../state/belegstelle-state.service';
import { takeUntil } from 'rxjs/operators';
import { LinkService } from '../../pages/page-manuscript/link.service';
import { LostPageNotificationService } from '../../../service/lost-page-notification.service';

@Component({
  selector: 'app-verweis-view-blatt-info',
  templateUrl: './verweis-view-blatt-info.component.html',
  styleUrl: './verweis-view-blatt-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerweisViewBlattInfoComponent implements OnInit, OnDestroy {

  @Input({ required : true }) agency: 'Src' | 'Target' = 'Src';

  themeBrightness$ = this._store
    .select(SelectedThemeState)
    .pipe(map((theme: GsmbTheme) => theme.brightness));

  verweis?: DisplayVerweis;

  private _destroy$ = new Subject<void>();

  get blattangabe(): string {
    const belegstelle = this.agency === 'Src' ? this.verweis?.srcBelegstelleObj : this.verweis?.targetBelegstelleObj;
    const physicality = this.agency === 'Src' ? this.verweis?.srcCarObj?.physicality : this.verweis?.targetCarPhysicality;
    const prefix = !belegstelle?.lost && physicality === 'Available' ?  'Bl. ' : '';
    return belegstelle ? `${prefix}${belegstelle.belegstelleText}` : '';
  }

  get alternativePageBlattangabe(): string {
    return this.verweis?.targetBelegstelleObj?.alternativePage?.pageText || '';
  }

  get missingTooltip(): string {
    const alternativeBlattangabe = this.alternativePageBlattangabe ?  ` Es wird stattdessen ${this.alternativePageBlattangabe} angezeigt.` : '';
    return `${this.verweis?.targetBelegstelleObj?.missingComment}${alternativeBlattangabe}`;
  }

  get carrierTitle(): string {
    let title;
    switch (this.agency) {
      case 'Target':
        if (this.verweis?.targetCarObj?.physicality === 'Available') {
          title = this.verweis?.targetCarObj?.shortName ? `${this.verweis?.targetCarObj?.shortName}, ${this.verweis.targetCarObj.shelfMark}` : this.verweis?.targetCarObj?.fullTitle;
        } else {
          title = this.verweis?.targetCarObj?.fullTitle || '';
        }
        break;
        case 'Src':
          title = this.verweis?.srcCarObj?.shortName? `${this.verweis?.srcCarObj?.shortName}, ${this.verweis?.srcCarObj?.shelfMark}` : this.verweis?.srcCarObj?.fullTitle;
          break;
    }
    return title || '';
  }

  get carrierDesc(): string {
    if (this.agency === 'Src') {
      return `${this.verweis?.srcCarObj?.getCarrierTypeDescDe() || ''} ${this.verweis?.srcCarObj?.inGsmBLibText  || ''}`;
    }
    return `${this.verweis?.targetCarObj?.getCarrierTypeDescDe() || ''} ${this.verweis?.targetCarObj?.inGsmBLibText  || ''}`;
  }

  get page(): Page | undefined {
    return this.agency === 'Src' ? this.verweis?.srcBelegstelleObj?.page : this.verweis?.targetBelegstelleObj?.getPageOrAlternativePage();
  }

  get isMissingPageOfExistingCarrier(): boolean {
    return this.agency === 'Target' && this.verweis?.targetCarPhysicality === 'Available' && this.verweis?.targetBelegstelleObj?.lost === true;
  }

  constructor(
    private _cdr: ChangeDetectorRef,
    private _lostPageNotificationService: LostPageNotificationService, // Keep for snack bar in case of a blatt is lost
    private _store: Store,
    private _vls: LinkService) {
  }

  ngOnInit() {
    this._store.select(SelectedVerweisState).pipe(takeUntil(this._destroy$)).subscribe((verweis: DisplayVerweis) => {
      this.verweis = verweis;
      this._cdr.detectChanges();
    });
  }

  openCarrierInNewTab() {
    if (!this.verweis) {
      console.error('Verweis is undefined');
      return;
    }
    this._vls.openTargetCarrierOfVerweis(this.verweis);

  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
