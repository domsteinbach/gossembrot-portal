import { GsmbResource } from "../data/repository/gsmb-resource";
import { LibraryData } from "../data/repository-model";

export class Library extends GsmbResource {
  static readonly tableName = "library";

  private _gndId: string;
  private _inst: string;
  private _loc: string;
  private _shortName: string;

  constructor(data: LibraryData) {
    super(data.id);
    this._gndId = data.gnd_id;
    this._loc = data.loc;
    this._inst = data.inst;
    this._shortName = data.short_name;
  }

  get gndId(): string {
    return this._gndId;
  }

  get loc() {
    return this._loc;
  }

  get inst(): string {
    return this._inst;
  }

  get shortName() {
    return this._shortName;
  }
}
