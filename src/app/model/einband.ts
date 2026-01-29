import { ExternalEntity } from "./external_entity";
import { GsmbResource } from "../data/repository/gsmb-resource";

export interface EinbandData {
  id: string;
  car_id: string;
  shelfmark: string;
  werkstatt: string;
  werkstatt_desc: string;
  werkzeug: string;
  werkzeug_desc: string;
}

export class Einband extends GsmbResource {
  static readonly tableName = "einband";
  carId: string;
  shelfmark: string;
  werkstatt: string;
  werkstattDesc: string;
  werkzeug: string;
  werkzeugDesc: string;
  private _externalEntity!: ExternalEntity | undefined | null;

  constructor(data: EinbandData) {
    super(data.id);
    this.carId = data.car_id;
    this.shelfmark = data.shelfmark;
    this.werkstatt = data.werkstatt;
    this.werkstattDesc = data.werkstatt_desc;
    this.werkzeug = data.werkzeug;
    this.werkzeugDesc = data.werkzeug_desc;
  }

  get externalEntity(): ExternalEntity | null | undefined {
    return this._externalEntity;
  }

  set externalEntity(value: ExternalEntity | undefined | null) {
    this._externalEntity = value;
  }
}
