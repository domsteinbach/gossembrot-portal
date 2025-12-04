import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import { DisplayVerweis } from '../../../../model/verweis';
import { Store } from '@ngxs/store';
import { SelectedVerweisState, UpdateSelectedVerweis,
} from '../../../../state/belegstelle-state.service';
import { CarrierText } from '../../../../model/carriertext';
import { ScrollIntoViewDirective } from '../../../../directives/scroll-into-view.directive';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import {GsmbResource} from "../../../../data/repository/gsmb-resource";

@Component({
  selector: 'app-outgoing-verweise-list',
  templateUrl: './outgoing-verweise-list.component.html',
  styleUrls: ['./outgoing-verweise-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutgoingVerweiseListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() texts: CarrierText[] = [];
  @Input() loading = false;
  @Input() highlightErwaehnungen = false;
  @Output() verweisSelected = new EventEmitter<DisplayVerweis>();

  @ViewChild('scrollDirective') scrollDirective!: ScrollIntoViewDirective;

  private _alreadyPrintedAbschnittMap = new Map<string, string>();
  private _alreadyPrintedPageMap = new Map<string, string>();

  selectedVerweis?: DisplayVerweis;

  verweisToInit: string | null = null;

  private _destroy$ = new Subject<void>();

  get selectedScrollTarget(): string {
    return this.selectedVerweis ? `${this.OUTGOING_PREFIX}${this.selectedVerweis.srcBelegstelle}` : '';
  }

  readonly OUTGOING_PREFIX = 'outgoing-';

  constructor(
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _store: Store,
  ) {
  }

  ngOnInit() {
    console.log('Outgoing Verweise List');
    this.verweisToInit = this._route.snapshot.queryParamMap.get('v');
    this._store.select(SelectedVerweisState).pipe(takeUntil(this._destroy$)).subscribe((v: DisplayVerweis) => {
      if (v) {
        this.selectedVerweis = v;
        this._cdr.detectChanges();
      }
    });
  }

  ngOnChanges(changes:SimpleChanges) {
    if (!this.texts.length || !changes['texts']) {
      return;
    }
    this._alreadyPrintedPageMap = new Map<string, string>();
    if (this.verweisToInit) {
      const verweis = this.texts.flatMap(t => t.outgoingVerweise).find(v => v.id === this.verweisToInit);
      if (verweis) {
        this.verweisToInit = null;
        setTimeout(() => {
          this.onVerweisClicked(verweis);
        }, 0);
      }
    }
    setTimeout(() => {
      this.scrollDirective.scrollToElement(this.selectedScrollTarget);
      this._cdr.detectChanges();
    }, 0);
  }

  closingAbschnitt(v: DisplayVerweis): boolean {
    if (v.srcBelegstelleObj?.abschnitt) {
      return false
    }
    const currentIndex = this.texts.flatMap(t => t.outgoingVerweise).findIndex(ov => ov.id === v.id);
    if (currentIndex < 1) {
      return false;
    }
    const previousVerweis = this.texts.flatMap(t => t.outgoingVerweise)[currentIndex - 1];
    return !!previousVerweis.srcBelegstelleObj?.abschnitt && previousVerweis.targetText === v.targetText;
  }

  displayAbschnitt(v: DisplayVerweis): boolean {
    if (!v.srcBelegstelleObj?.abschnitt) {
      return false;
    }
    const key = `${v.srcText}${v.srcBelegstelleObj.abschnitt}`;
    const printedBy = this._alreadyPrintedAbschnittMap.get(key);

    if (printedBy) { // only print for the page for that one abschnitt
      return printedBy === v.id;
    }
    this._alreadyPrintedAbschnittMap.set(key, v.id);
    return true;
  }

  displayPage(v: DisplayVerweis): boolean {
    if (!v.srcBelegstelleObj) {
      return false;
    }
    const printedBy = this._alreadyPrintedPageMap.get(v.srcBelegstelleText);

    if (printedBy) { // only print for the page
      return printedBy === v.id;
    }
    this._alreadyPrintedPageMap.set(v.srcBelegstelleText, v.id);
    return true;
  }

  displayWortlaut(verweis: DisplayVerweis) {
    const currentText = this.texts.find((t) => t.id === verweis.srcText);
    const vIndex = currentText?.outgoingVerweise.findIndex(v => v.id === verweis.id);
    const verweisbefore = vIndex && vIndex > 0 ? currentText?.outgoingVerweise[vIndex - 1] : undefined;
    return verweisbefore ? verweisbefore.srcBelegstelleObj?.wortlautTeiXml !== verweis.srcBelegstelleObj?.wortlautTeiXml : true;
  }

  isPartOfOutgoingVerweise(v: DisplayVerweis): boolean {
    return this.texts.flatMap(t => t.outgoingVerweise).some(v2 => v2.id === v.id);
  }

  onVerweisClicked(v: DisplayVerweis): void {
    this.selectedVerweis = v;
    this.verweisSelected.emit(v);
    this._cdr.detectChanges();
    this._store.dispatch(new UpdateSelectedVerweis(v));
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
