import { CarrierTextData } from '../data/repository-model';
import { Author } from './author';
import { GsmbResource } from '../data/repository/gsmb-resource';
import { InformationCarrier } from './infoCarrier';
import { DisplayVerweis } from './verweis';
import { Belegstelle } from './belegstelle';

/***
 * The texts of a carrier like in the database. Usable for writing to the database.
 */
export class CarrierText extends GsmbResource {
  static readonly tableName = 'carrier_text';
  private _authorId: string;
  private _carId: string;
  private _description: string;
  private _isLost: boolean;
  private _short: string;
  private _sortInCar: number;
  protected _title: string;
  protected _text_range: string;

  constructor(data: CarrierTextData) {
    super(data.id);
    this._authorId = data.author_id;
    this._carId = data.car_id;
    this._description = data.description;
    this._isLost = data.is_lost === 1;
    this._short = data.short;
    this._sortInCar = data.sort_in_car;
    this._title = data.title;
    this._text_range = data.text_range;
  }

  get carId(): string {
    return this._carId;
  }

  get authorId(): string {
    return this._authorId;
  }

  get isLost(): boolean {
    return this._isLost;
  }

  get sortInCar(): number {
    return this._sortInCar;
  }

  get title(): string {
    if (this._title.includes('<incipit>')) {
      return  this._title.split('<incipit>')[0].trim();
    }
    return this._title.trim();
  }

  get textRange(): string {
    const prefix = this._text_range.startsWith('Karta') ? '' : 'Bl. ';
    return this._text_range ? `${prefix}${this._text_range}` : '';
  }
}

export class DisplayCarrierText extends CarrierText {
  private _author!: Author | undefined;
  private _carrier: InformationCarrier | undefined;

  private _outgoingVerweise: DisplayVerweis[] = [];
  private _incomingVerweise: DisplayVerweis[] = [];
  private _incipit = '';

  constructor(data: CarrierTextData, carrier?: InformationCarrier) {
    super(data);
    this._carrier = carrier;
  }

  get author(): Author | undefined {
    return this._author;
  }

  set author(author: Author | undefined) {
    this._author = author;
  }

  get cognomen(): string {
    return this._author?.cognomen || '';
  }

  get authorGndId(): string {
    return this._author?.gndId || '';
  }

  get authorGndIdAlternate(): string {
    return this._author?.gndIdAlternate || '';
  }

  get fullTitle(): string {
    let title = this._title;
    if (this._title.includes('<incipit>')) {
      title = this._title.split('<incipit>')[0].trim();
      this._incipit = this._title.split('<incipit>')[1].replace('</incipit>', '').trim();
    }
    const c = this.cognomen ? `${this.cognomen}: ` : '';
    const t = `${c}${title}`;
    return this.textRange && !this._incipit ? `${t} (${this.textRange})` : t;
  }

  get incipit(): string {
    return this._incipit;
  }

  get carrier(): InformationCarrier | undefined {
    return this._carrier;
  }

  set carrier(carrier: InformationCarrier | undefined) {
    this._carrier = carrier;
  }

  get outgoingVerweise() {
    return this._outgoingVerweise;
  }

  set outgoingVerweise(v) {
    this._outgoingVerweise = v;
  }

  get incomingVerweise() {
    return this._incomingVerweise;
  }

  // incoming verweise including nennungen
  set incomingVerweise(val: DisplayVerweis[]) {
    this._incomingVerweise = val;
  }

  get hasIncomingVerweis() {
    return this.incomingVerweise.length > 0;
  }

  get incomingNennungen() {
    return this._incomingVerweise.filter((v) => v.type === 'Nennung');
  }

  get hasIncomingNennung() {
    return this.incomingNennungen.filter((v) => v.type === 'Nennung').length > 0;
  }

  get isOnlyNennung() {
    return this.hasIncomingNennung && this.incomingVerweise.length === this.incomingNennungen.length;
  }

  get carrierFulltitle(): string {
    return this._carrier?.fullTitle || '';
  }
}
