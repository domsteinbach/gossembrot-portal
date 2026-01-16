import {ChangeDetectorRef, Component, Input, OnChanges} from '@angular/core';
import { DisplayVerweis } from '../../../model/verweis';
import { LinkService } from '../../pages/page-manuscript/link.service';
import { AuthService } from '../../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '../../../routeConstants';

@Component({
  selector: 'app-verweis-link-icon-component',
  standalone: false,
  templateUrl: './verweis-link-icon-component.component.html',
  styleUrl: './verweis-link-icon-component.component.scss'
})
export class VerweisLinkIconComponentComponent implements OnChanges {
  @Input({required: true}) displayedAgent!: 'incoming' | 'outgoing';
  @Input() verweis?: DisplayVerweis;
  @Input() hideDetail = false; // If true, the detail view link/icon is hidden
  @Input() embed = false; // If true, the icon is embedded in text, otherwise as absolute icons above the parent

  hideIfSynopsys = false;

  iconsFlicker = false;
  private iconsFlickerT?: number;

  oldBelegstelleId: string | null = null;

  constructor(
    public auth: AuthService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _vls: LinkService) {
  }

  ngOnChanges() {
    this.hideIfSynopsys = this._route.snapshot.url[0].path === RouteConstants.VERWEIS
    if (this.oldBelegstelleId === this.verweis?.srcBelegstelle) {
      this.runIconFlicker();
    } else {
        this.oldBelegstelleId = this.verweis?.srcBelegstelle || null;
    }
  }

  runIconFlicker() {
    this.iconsFlicker = false;
    window.clearTimeout(this.iconsFlickerT);

    requestAnimationFrame(() => {
      this.iconsFlicker = true;
      this._cdr.detectChanges();
      this.iconsFlickerT = window.setTimeout(() => (this.iconsFlicker = false), 400);
    });
  }

  openTargetOfVerweis(): void {
    this._vls.openTargetCarrierOfVerweis(this.verweis!);
  }

  openSourceOfVerweis() { // Todo: Move that to child!
    this._vls.openSourceCarrierOfVerweis(this.verweis!);
  }

  openVerweisInDialog(): void {
    this._vls.openVerweisViewDialog(this.verweis!, 'target', this.hideIfSynopsys);
  }

  openVerweisInSyopsis(): void {
    this._vls.openInVerweisSynopsis(this.verweis!);
  }

}
