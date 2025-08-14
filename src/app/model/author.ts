import {GsmbResource} from "../data/repository/gsmb-resource";
import { EnvConstants } from '../constants';
import { GndAuthor } from './gnd-authors';

export interface AuthorData {
    id: string;
    cognomen: string;
    relation_to_gsmb: string;
    gnd_id: string;
    gnd_id_alternate: string;
    _src_file: string;
    _src_text_in_file: string;
}

export class Author extends GsmbResource{
    static readonly tableName = 'author';
    private _cognomen: string;
    private _relation_to_gsmb: string;
    private _gndId: string;
    private _gndIdAlternate: string;
    private _srcFile: string;
    private _srcTextInFile: string;
    private _gndData?: GndAuthor = undefined;

    constructor(authorData: AuthorData) {
        super(authorData.id);
        this._cognomen = authorData.cognomen;
        this._relation_to_gsmb = authorData.relation_to_gsmb;
        this._gndId = authorData.gnd_id;
        this._gndIdAlternate = authorData.gnd_id_alternate;
        this._srcFile = authorData._src_file;
        this._srcTextInFile = authorData._src_text_in_file;
    }

    get cognomen(): string {
        return this._cognomen || '';
    }

    get gndId(): string {
        return this._gndId || '';
    }

    get linkToGnd() {
        return this._gndId ? `${EnvConstants.GND_BASEURL}${this._gndId}` : '';
    }

    get gndIdAlternate(): string {
        return this._gndIdAlternate || '';
    }

    get linkToGndAlternate() {
        return this._gndIdAlternate ? `${EnvConstants.GND_BASEURL}${this._gndIdAlternate}` : '';
    }

    get srcFile() {
        return this._srcFile;
    }

    get srcTextInFile() {
        return this._srcTextInFile;
    }

    get gndData(): GndAuthor | undefined {
        return this._gndData;
    }

    set gndData(gndData: GndAuthor) {
        this._gndData = gndData;
    }

}
