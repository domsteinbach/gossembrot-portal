import { Component, Inject } from "@angular/core";
import { AsyncPipe, NgIf } from "@angular/common";
import {
  MatList,
  MatListItem,
  MatListOption,
  MatSelectionList,
} from "@angular/material/list";
import { Observable } from "rxjs";
import { ColumnDef, TableName } from "../../data-search-types";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { TableDisplayService } from "../../service/table-display.service";
import { MatCheckbox } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "app-column-settings",
  standalone: true,
  imports: [
    AsyncPipe,
    MatListOption,
    MatSelectionList,
    MatDialogTitle,
    MatButton,
    MatDialogActions,
    MatCheckbox,
    FormsModule,
    NgIf,
    MatListItem,
    MatList,
    MatDivider,
  ],
  templateUrl: "./column-settings.component.html",
  styleUrl: "./column-settings.component.scss",
})
export class ColumnSettingsComponent {
  columns$: Observable<ColumnDef[]>;

  constructor(
    private _dialogref: MatDialogRef<ColumnSettingsComponent>,
    private _ts: TableDisplayService,
    @Inject(MAT_DIALOG_DATA) public data: { tableName: TableName }, // Inject dialog data
  ) {
    this.columns$ = this._ts.getColumnsToDisplay$(this.data.tableName);
  }

  toggleDisplayedColumn(column: ColumnDef) {
    column.displayed = !column.displayed;
    this._ts.setColumnForTable(this.data.tableName, column);
  }

  toggleDisplayedFilter(column: ColumnDef) {
    column.displayFilter = !column.displayFilter;
    this._ts.setDisplayedFilter(this.data.tableName, column);
  }

  closeDialog() {
    this._dialogref.close();
  }
}
