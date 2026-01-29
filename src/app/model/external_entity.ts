export interface ExternalEntityData {
  id: string;
  obj_id: string;
  obj_type: number;
  third_party_id: string;
  third_party_link: string;
  third_party_host: string;
}

enum ExternalEntityType {
  Einband = 1,
  Werkstatt = 2,
  Werkzeug = 3,
  Digitalfaksimile = 4,
  Handschriftenportal = 5,
  Handschriftencensus = 6,
}

export type ExternalEntityObjType = keyof typeof ExternalEntityType;

export class ExternalEntity {
  static readonly tableName = "external_entities";
  id: string;
  objId: string;
  objType: ExternalEntityObjType;
  thirdPartyId: string;
  thirdPartyLink: string;
  thirdPartyHost: string;

  constructor(data: ExternalEntityData) {
    this.id = data.id;
    this.objId = data.obj_id;
    this.objType = ExternalEntityType[
      data.obj_type
    ] as unknown as ExternalEntityObjType;
    this.thirdPartyId = data.third_party_id;
    this.thirdPartyLink = data.third_party_link;
    this.thirdPartyHost = data.third_party_host;
  }
}
