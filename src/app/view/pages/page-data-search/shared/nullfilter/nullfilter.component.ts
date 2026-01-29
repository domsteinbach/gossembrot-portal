import { Component, Input, OnInit } from "@angular/core";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from "@angular/material/card";
import { Column, NullFilter, TableName } from "../../data-search-types";
import { TableDisplayService } from "../../service/table-display.service";
import { NgForOf } from "@angular/common";
import { MatCheckbox } from "@angular/material/checkbox";
import { ValueFilterService } from "../../service/value-filter.service";

@Component({
  selector: "app-null-filter",
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    NgForOf,
    MatCheckbox,
  ],
  templateUrl: "./nullfilter.component.html",
  styleUrls: [
    "../../page-data-search.component.scss",
    "./nullfilter.component.scss",
  ],
})
export class NullFilterComponent implements OnInit {
  @Input({ required: true }) tableName!: TableName;

  nullFilters = new Map<Column, NullFilter>();

  get nullFilterArr(): NullFilter[] {
    return Array.from(this.nullFilters.values());
  }

  constructor(
    private _ts: TableDisplayService,
    private _vf: ValueFilterService,
  ) {}

  ngOnInit() {
    if (!this.tableName) {
      return;
    }
    this._ts.getNullFiltersToDisplay(this.tableName).forEach((c) => {
      this.nullFilters.set(c.column, {
        column: c,
        showNonNullValues: true,
        showNullValues: true,
      });
    });
  }

  toggleShowNullvalues(column: Column): void {
    const filter = this.nullFilters.get(column);
    if (!filter) {
      return;
    }
    filter.showNullValues = !filter.showNullValues;
    this._vf.updateNullFilter(this.tableName, filter);
  }

  toggleShowNonNullvalues(column: Column): void {
    const filter = this.nullFilters.get(column);
    if (!filter) {
      return;
    }
    filter.showNonNullValues = !filter.showNonNullValues;
    this._vf.updateNullFilter(this.tableName, filter);
  }
}
