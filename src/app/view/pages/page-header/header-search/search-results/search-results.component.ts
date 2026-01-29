import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  SearchResult,
  SearchResultTable,
} from "../../../../../model/search-result";
import { SearchService } from "../../../../../service/search-service.service";
import { SearchType } from "../../../../../data/repository/search-data-repository";

@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.component.html",
  styleUrl: "./search-results.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnChanges {
  @Input() searchResults: SearchResult[] = [];
  @Input() searchTerm = "";
  @Input() searchType: SearchType = "unset";
  @Input() showCloseButton = false;
  @Output() closeResults = new EventEmitter<void>();

  groupOrder: { type: SearchResultTable; label: string }[] = [];

  resultGroups: Record<SearchResultTable, SearchResult[]> = {
    author: [],
    info_carrier: [],
    carrier_text: [],
    belegstelle: [],
    naming_gossembrot: [],
    library: [],
  };

  visibleGroups: Partial<Record<SearchResultTable, boolean>> = {};

  constructor(private _search: SearchService) {
    this.groupOrder = this._search.GROUP_ORDER.filter(
      (group) => group.type !== "library" && group.type !== "info_carrier",
    );
    this.groupOrder.forEach((group) => {
      this.visibleGroups[group.type] = true;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchResults"]) {
      this._updateResultGroups();
    }
  }

  private _updateResultGroups(): void {
    this.resultGroups = {
      author: [],
      info_carrier: [],
      carrier_text: [],
      belegstelle: [],
      naming_gossembrot: [],
      library: [],
    };

    for (const result of this.searchResults) {
      this.resultGroups[result.type].push(result);
    }
  }
}
