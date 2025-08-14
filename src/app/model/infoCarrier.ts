import { InformationCarrierData } from '../data/repository-model';
import { NamingGossembrot } from './naming-gsmb';
import { GsmbResource } from '../data/repository/gsmb-resource';
import { Library } from './library';
import { ExternalEntity } from './external_entity';
import { Einband } from './einband';

export enum InfoCarrierTypes {
  Manuscript = 0,
  Print = 1,
  Classic = 2,
  NonHabeo = 3, // Non-Habeo, A work Gsmb explicitely does not have
}

export type InfoCarrierType = keyof typeof InfoCarrierTypes;

export type InfoCarrierTypeDe = 'Handschrift' | 'Druck' | 'Werk' | 'Textträger';

// the physicality of an info carrier
export enum Physicalities {
  Available = 0,
  Lost = 1,
  Classic = 2,
}

export type Physicality = 'Available' | 'Lost' | 'Classic';

export type Casus = 'Nominativ' | 'Dativ';
/**
 * the main class for information carriers; extended by all other info carrier classes
 *
 */
export class InformationCarrier extends GsmbResource {
  static readonly tableName = 'info_carrier';
  readonly _dfId: string;
  protected _title: string;
  protected _description: string;
  protected _matDescription: string;
  protected _carrierType: InfoCarrierType;
  protected _isLost: boolean; // whether the infoCarrier is lost/reconstructed or is accessible for researches
  protected _physicality: Physicality; //
  protected _inGsmbsLib: boolean;
  protected _rekByJoa: string;
  protected _libId: string;
  private _library?: Library
  protected _shelfMark: string; // the shelfmark of the physical info carrier in a library
  protected _firstPageIdx: number; // the first relevant page for an info carrier
  private _fileName: string;
  readonly has_incoming_verweis: boolean;
  readonly has_outgoing_verweis: boolean;
  private _namingsGossembrot: NamingGossembrot[] = [];
  einbandInfo: Einband[] | undefined;
  externalDigitalisat: ExternalEntity | undefined;
  handschriftenPortal: ExternalEntity | undefined;
  handschriftenCensus: ExternalEntity | undefined;

  constructor(data: InformationCarrierData) {
    super(data.id);
    this._dfId = data.df_id; // marks that the information carrier is on of the hssfaks digitalfaksimiles
    this._title = data.title;
    this._description = data.description;
    this._matDescription = data.mat_description;
    this._carrierType = InfoCarrierTypes[
      data.type
    ] as unknown as InfoCarrierType;
    this._inGsmbsLib = data.in_gsmbs_lib === 1;
    this._rekByJoa = data.rek_by_joa;
    this._isLost = data.physicality === 1;
    this._physicality = Physicalities[
      data.physicality
    ] as unknown as Physicality;
    this._libId = data.lib_id;
    this._shelfMark = data.sig;
    this._fileName = data.file_name;
    this._firstPageIdx = data.first_page_idx || 0;
    this.has_incoming_verweis = data.has_incoming_verweis === 1;
    this.has_outgoing_verweis = data.has_outgoing_verweis === 1;
  }

  get dfId(): string {
    return this._dfId;
  }

  get library(): Library | undefined {
    return this._library;
  }

  set library(value: Library | undefined) {
    this._library = value;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get description(): string {
    return this._description;
  }

  get matDescription(): string {
    return this._matDescription;
  }

  get fullTitle(): string {
    const matDescription = this._matDescription
      ? ', ' + this._matDescription
      : '';
    return this._title + matDescription;
  }

  get shortName() {
    return this.library?.shortName
  }

  get carrierType(): InfoCarrierType {
    return this._carrierType;
  }

  // german version of carrierType
  get carrierTypeDe(): InfoCarrierTypeDe {
    switch (this._carrierType) {
      case 'Manuscript':
        return 'Handschrift';
      case 'Print':
        return 'Druck';
      case 'Classic':
        return 'Werk';
      case 'NonHabeo':
        return 'Textträger';
    }
  }

  // rekonstruierter Druck, rekonstruierte Handschrift, kanonisches Werk
  getCarrierTypeDescDe(casus: Casus = 'Nominativ'): string {
    return `${this.reconstrPrefix()}${this.reconstrPrefix() ? this._reconstrCasusSuffix(casus) + ' ':''}${this.carrierTypeDe}`;
  }

  getCarrierTypeDescDeLowerCased(casus: Casus = 'Nominativ'): string {
    if (this._physicality === 'Available') {
      return this.getCarrierTypeDescDe(casus)
    }
    return this.getCarrierTypeDescDe(casus).charAt(0).toLowerCase()+this.getCarrierTypeDescDe(casus).slice(1);
  }

  private reconstrPrefix(): string {
    if (this._physicality === 'Available') {
      return '';
    }
    switch (this.carrierTypeDe) {
      case 'Handschrift':
        return 'rekonstruiert';
      case 'Druck':
        return 'rekonstruiert';
      case 'Werk':
        return 'kanonisch';
      case 'Textträger':
        return 'rekonstruiert';
    }
  }

  private _reconstrCasusSuffix(casus: Casus): string {
    switch (this.carrierTypeDe) {
      case 'Handschrift':
        return casus === 'Nominativ' ? 'e' : 'er';
      case 'Druck':
        return casus === 'Nominativ' ? 'er' : 'em'
      case 'Werk':
        return casus === 'Nominativ' ? 'es' : 'em';
      case 'Textträger':
        return casus === 'Nominativ' ? 'er' : 'em';
    }
  }

  // return the text "Verweise auf diese[*] [*]
  verweiseAufDiesenStr(): string {
    const t = this.carrierType !== 'NonHabeo' ? 'Verweise auf diese' : 'Verweis auf diesen';
    switch (this.carrierTypeDe) {
      case 'Handschrift':
        return `${t} Handschrift`;
      case 'Druck':
        return `${t}n Druck`;
      case 'Werk':
        return `${t}s kanonische Werk`;
      case 'Textträger':
        return `${t} Textträger`;

    }
  }

  get isLost(): boolean {
    return this._isLost;
  }

  get physicality(): Physicality {
    return this._physicality;
  }

  get physicalityDe(): string {
    switch (this._physicality) {
      case 'Available':
        return 'erhalten';
      case 'Lost':
        return 'rekonstruiert';
      case 'Classic':
        return 'kanonisch';
    }
  }

  get shelfMark(): string {
    return this._shelfMark;
  }

  get fileName(): string {
    return this._fileName;
  }

  get inGsmbsLib(): boolean {
    return this._inGsmbsLib;
  }

  get libId(): string {
    return this._libId;
  }

  get firstPageIdx(): number {
    return this._firstPageIdx;
  }

  get namingsGossembrot() {
    return this._namingsGossembrot;
  }

  set namingsGossembrot(values: NamingGossembrot[]) {
    this._namingsGossembrot = [...values];
  }

  get mainNamingGossembrot(): string | undefined {
    return this._namingsGossembrot.length ? this._namingsGossembrot[0].benennung : undefined;
  }

  get inGsmBLibText(): string {
    return this._inGsmbsLib ? 'aus Gossembrots Bibliothek' : 'ausserhalb Gossembrots Bibliothek';
  }

  // Helper methods

  // provides a string for sorting the carriers by title
  // add leading zeros to the numbers in the title, so that the sorting works correctly
  get sort_arg(): string {
    return this._title.replace(/\d+(\.\d+)?/g, (match) => {
      return match
        .split('.')
        .map((part) => part.padStart(8, '0'))
        .join('.');
    });
  }
}
