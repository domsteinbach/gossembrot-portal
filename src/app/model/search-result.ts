import { SearchResultData } from '../data/repository-model';

export type SearchResultTable = 'author' | 'carrier_text' | 'info_carrier' | 'belegstelle' | 'naming_gossembrot' | 'library';

export class SearchResult {
    static readonly tableName = 'search_result';
    private _id: string;
    private _label: string;
    private _searchString: string;
    private _type: SearchResultTable;

    constructor(searchResultData: SearchResultData) {
        this._id = searchResultData.id;
        this._label = searchResultData.label;
        this._searchString = searchResultData.search_string;
        this._type = searchResultData.type as SearchResultTable;
    }

    get id(): string {
        return this._id;
    }

    get label(): string {
        return this._label;
    }

    get searchString(): string {
        return this._searchString;
    }

    get type(): SearchResultTable {
        return this._type;
    }
}

export interface Isophonem {
    searchTerm: string;
    includes: string[];
}

