import { InformationCarrier } from "./infoCarrier";

export interface NamingGossembrotData {
  id: string;
  car_id: string;
  benennung: string;
  source: string;
}

export class NamingGossembrot {
  static readonly tableName = "naming_gossembrot";
  id: string;
  carId: string;
  benennung: string;
  source: string;
  infoCarrier?: InformationCarrier;

  constructor(data: NamingGossembrotData) {
    this.id = data.id;
    this.carId = data.car_id;
    this.benennung = data.benennung;
    this.source = data.source;
  }
}
