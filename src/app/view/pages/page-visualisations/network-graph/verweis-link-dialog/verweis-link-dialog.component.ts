import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { VisualisationVerweis } from '../../../../../model/visualisations';

@Component({
  selector: 'app-verweis-link-dialog',
  standalone: true,
  imports: [MatDialogActions, MatDialogContent, CdkDrag],
  templateUrl: './verweis-link-dialog.component.html',
  styleUrl: './verweis-link-dialog.component.scss',
})
export class VerweisLinkDialogComponent {
  verweis: VisualisationVerweis;
  constructor(
    public dialogRef: MatDialogRef<VerweisLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.verweis = data.linkData;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
