import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DisplayVerweis } from '../../../model/verweis';
import { View } from './verweis-view.types';
import { PageOfMissingCarrier, Page } from '../../../model/page';
import { AuthService } from '../../../auth/auth.service';
import { LinkService } from '../page-manuscript/link.service';

export interface VerweisViewData {
  verweis: DisplayVerweis;
  view: View;
  hideSynopsisButton? : boolean;
}

@Component({
  selector: 'app-verweis-view',
  standalone: false,
  templateUrl: './verweis-view.component.html',
  styleUrl: './verweis-view.component.scss',
})
export class VerweisViewComponent implements OnInit {

  targetPage?: Page;

  get srcPage(): Page | undefined {
    return this.data.verweis.srcBelegstelleObj?.page;
  }

  get wortlautTeiXml(): string {
    return this.data.verweis.srcBelegstelleObj?.wortlautTeiXml || '';
  }

  get displayCommentIcon(): boolean {
    return this._auth.isAuthenticated() && (
      this.data.verweis.generalInsecurity || this.data.verweis.insecurity > 0);
  }

  get commentText(): string {
    const priority = this.data.verweis.insecurity > 0 ? `Priorität ${this.data.verweis.insecurity}. ` : '';
    return `${priority}${this.data.verweis.bemerkungen}`;
  }

  constructor(@Inject(MAT_DIALOG_DATA)
              public data: VerweisViewData,
              private _dialogRef: MatDialogRef<VerweisViewComponent>,
              public _auth: AuthService,
              private _vls: LinkService) {
  }

  ngOnInit() {
    this.targetPage = this.getTargetPage();
  }

  getTargetPage(): Page | undefined {
    return this.data.verweis.targetCarObj?.physicality !== 'Available' ? new PageOfMissingCarrier() : this.data.verweis.targetBelegstelleObj?.getPageOrAlternativePage();
  }

  openInVerweisSynopsis() {
    this._vls.openInVerweisSynopsis(this.data.verweis);
  }

  onClose() {
    this._dialogRef.close();
  }
}
