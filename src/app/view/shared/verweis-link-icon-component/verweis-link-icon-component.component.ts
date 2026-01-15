import {Component, Input, OnChanges} from '@angular/core';
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
  @Input() hideDetail = false; // If true, the target icon is shown, otherwise only the source icon
  @Input() embed = false; // If true, the icon is embedded in text, otherwise as absolute icons above the parent

  hideIfSynopsys = false;

  constructor(
    public auth: AuthService,
    private _route: ActivatedRoute,
    private _vls: LinkService) {
  }

  ngOnChanges() {
    this.hideIfSynopsys = this._route.snapshot.url[0].path === RouteConstants.VERWEIS
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
