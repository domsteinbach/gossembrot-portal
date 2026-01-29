import { VerweisData } from "../data/repository-model";
import { Belegstelle } from "./belegstelle";
import { InformationCarrier, Physicality } from "./infoCarrier";
import { CarrierText } from "./carriertext";
import { GsmbResource } from "../data/repository/gsmb-resource";
import {
  MissingPageOfExistingCarrier,
  NullPage,
  PageOfClassicText,
  PageOfMissingCarrier,
} from "./page";

export enum VerweisTypes {
  Verweis = 0,
  Erwaehnung = 1,
}

export type VerweisType = "Verweis" | "Erwaehnung";

export class Verweis extends GsmbResource {
  protected _type: VerweisType;
  protected _filename: string;
  protected _insecurity: number;
  protected _generalInsecurity: boolean;
  protected _srcBelegstelle: string;
  protected _srcCar: string;
  protected _srcText: string;
  protected _targetBelegstelle: string;
  protected _targetCar: string;
  protected _targetText: string;
  protected _bemerkungen: string;

  constructor(data: VerweisData) {
    super(data.id);
    this._type = VerweisTypes[data.type] as unknown as VerweisType;
    this._filename = data.file_name;
    this._insecurity = data.insecurity;
    this._generalInsecurity = data.general_insecurity === 1;
    this._srcBelegstelle = data.src_belegstelle;
    this._srcCar = data.src_car;
    this._srcText = data.src_text;
    this._targetBelegstelle = data.target_belegstelle;
    this._targetCar = data.target_car;
    this._targetText = data.target_text;
    this._bemerkungen = data.bemerkungen;
  }

  get type(): VerweisType {
    return this._type;
  }

  get insecurity(): number {
    return this._insecurity;
  }

  get generalInsecurity(): boolean {
    return this._generalInsecurity;
  }

  get bemerkungen(): string {
    return this._bemerkungen;
  }

  get srcBelegstelle(): string {
    return this._srcBelegstelle;
  }

  get srcCar(): string {
    return this._srcCar;
  }

  get srcText(): string {
    return this._srcText;
  }

  get targetBelegstelle(): string {
    return this._targetBelegstelle;
  }

  get targetCar(): string {
    return this._targetCar;
  }

  get targetText(): string {
    return this._targetText;
  }
}

export class DisplayVerweis extends Verweis {
  static readonly tableName = "verweis";
  private _srcCarObj?: InformationCarrier;
  private _srcTextObj?: CarrierText;
  private _srcBelegstelleObj?: Belegstelle;
  private _targetCarObj?: InformationCarrier;
  private _targetTextObj?: CarrierText;
  private _targetBelegstelleObj?: Belegstelle;

  constructor(data: VerweisData) {
    super(data);
  }

  get srcCarObj(): InformationCarrier | undefined {
    return this._srcCarObj;
  }

  set srcCarObj(value: InformationCarrier | undefined) {
    this._srcCarObj = value;
  }

  get srcTextObj(): CarrierText | undefined {
    return this._srcTextObj;
  }

  set srcTextObj(value: CarrierText | undefined) {
    this._srcTextObj = value;
  }

  get srcBelegstelleObj(): Belegstelle | undefined {
    return this._srcBelegstelleObj;
  }

  set srcBelegstelleObj(value: Belegstelle | undefined) {
    this._srcBelegstelleObj = value;
  }

  get srcBelegstelleText(): string {
    return `${this.srcCarObj?.fullTitle || ""}, ${this.srcBelegstelleObj?.belegstelleText || ""}`;
  }

  get targetCarObj(): InformationCarrier | undefined {
    return this._targetCarObj;
  }

  set targetCarObj(value: InformationCarrier | undefined) {
    this._targetCarObj = value;
  }

  get srcTextTitle(): string {
    return this._srcTextObj?.title || "";
  }

  get targetTextObj(): CarrierText | undefined {
    return this._targetTextObj;
  }

  set targetTextObj(value: CarrierText | undefined) {
    this._targetTextObj = value;
  }

  get targetTextTitle(): string {
    return this._targetTextObj?.title || "";
  }

  get targetPage() {
    switch (this.targetCarObj?.physicality) {
      case "Available":
        return (
          this.targetBelegstelleObj?.getPageOrAlternativePage() ||
          new MissingPageOfExistingCarrier()
        );
      case "Classic":
        return new PageOfClassicText();
      case "Lost":
        return new PageOfMissingCarrier();
      default:
        return new NullPage();
    }
  }

  get targetBelegstelleObj(): Belegstelle | undefined {
    return this._targetBelegstelleObj;
  }

  set targetBelegstelleObj(value: Belegstelle | undefined) {
    this._targetBelegstelleObj = value;
  }

  get targetCarFullTitle(): string {
    return this._targetCarObj?.fullTitle
      ? this._targetCarObj.fullTitle
      : this.targetCarObj?.title || "";
  }

  get targetCarPhysicality(): Physicality {
    return this._targetCarObj?.physicality || "Lost";
  }

  get isSelfTargeting(): boolean {
    return this.srcCar === this.targetCar;
  }

  get srcTextAuthorCognomen(): string {
    return this.srcTextObj?.authorsCognomen || "";
  }

  get targetTextAuthorCognomen(): string {
    return this.targetTextObj?.authorsCognomen || "";
  }

  get sortArgForSrcBelegstelle(): string {
    return this.srcBelegstelleText.replace(/\d+(\.\d+)?/g, (match) => {
      return match
        .split(".")
        .map((part) => part.padStart(8, "0"))
        .join(".");
    });
  }

  get srcBlattangabe(): string {
    return this.srcBelegstelleObj?.belegstelleText || "";
  }

  get targetBlattangabe(): string {
    if (
      this.targetCarObj?.physicality === "Lost" &&
      !this.targetBelegstelleObj?.belegstelleText
    ) {
      return "Karta ?";
    }
    return this.targetBelegstelleObj?.belegstelleText || "";
  }

  get sortInSourceCarrier(): number {
    return this.srcBelegstelleObj!.sortInCar;
  }

  get srcBlattSortInCar(): number {
    return this.srcBelegstelleObj!.page!.idx;
  }

  get wortlaut(): string {
    return this.srcBelegstelleObj?.wortlaut || "";
  }

  get wortlautTeiXml(): string {
    return this.srcBelegstelleObj?.wortlautTeiXml || "";
  }

  get wortlautSearchstring(): string {
    return this.srcBelegstelleObj?.wortlautSearchstring || "";
  }

  get targetBlattIsFragment(): boolean {
    return this.targetBelegstelleObj?.isFragment || false;
  }
}
