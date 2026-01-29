import { CarrierTextData } from '../data/repository-model';
import { Author } from './author';
import { GsmbResource } from '../data/repository/gsmb-resource';
import { InformationCarrier } from './infoCarrier';
import { DisplayVerweis } from './verweis';

/***
 * The texts of a carrier like in the database. Usable for writing to the database.
 */export class CarrierText extends GsmbResource {
  static readonly tableName = 'carrier_text';

  private _authorId: string;
  private _carId: string;
  private _isLost: boolean;
  private _sortInCar: number;
  private _title: string;
  private _text_range: string;
  private _incipit = '';
  private _additionalSource = '';
  private _author!: Author | undefined;
  private _carrier: InformationCarrier | undefined;
  private _outgoingVerweise: DisplayVerweis[] = [];
  private _incomingVerweise: DisplayVerweis[] = [];
  private _is_author_insecure: boolean;
  private _first_page_id = '';

  constructor(data: CarrierTextData, carrier?: InformationCarrier) {
    super(data.id);
    this._authorId = data.author_id;
    this._carId = data.car_id;
    this._isLost = data.is_lost === 1;
    this._sortInCar = data.sort_in_car;
    this._title = data.title;
    this._text_range = data.text_range;
    this._incipit = data.incipit;
    this._additionalSource = data.additional_source || '';
    this._carrier = carrier;
    this._is_author_insecure = data.is_author_insecure === 1;
    this._first_page_id = data.first_page_id;
  }

  get authorId(): string {
    return this._authorId;
  }

  get carId(): string {
      return this._carId;
  }

  get isLost(): boolean {
    return this._isLost;
  }

  get sortInCar(): number {
    return this._sortInCar;
  }

  get title(): string {
    return this._title;
  }

  get textRange(): string {
    const prefix = this._text_range?.startsWith('Karta') ? '' : 'Bl. ';
    return this._text_range ? `${prefix}${this._text_range}` : '';
  }

  get author(): Author | undefined {
    return this._author;
  }

  set author(author: Author | undefined) {
    this._author = author;
  }

  get authorsCognomen(): string {
    const insecurrityMarker = this._author?.cognomen && this.isAuthorInsecure ? '?' : '';
    return this._author?.cognomen ? this._author?.cognomen + insecurrityMarker : '';
  }

  get authorGndId(): string {
    return this._author?.gndId || '';
  }

  get authorGndIdAlternate(): string {
    return this._author?.gndIdAlternate || '';
  }

    get isAuthorInsecure(): boolean {
        return this._is_author_insecure;
    }

  get fullTitle(): string {
    const c = this.authorsCognomen ? `${this.authorsCognomen}: ` : '';
    const t = `${c}${this.title}`;
    return this.textRange ? `${t} (${this.textRange})` : t;
  }

  get incipit(): string {
    return this._incipit;
  }

    get additionalSource(): string {
        return this._additionalSource;
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
  // incoming verweise including erwaehnungen
  set incomingVerweise(val: DisplayVerweis[]) {
    this._incomingVerweise = val;
  }

  get hasIncomingVerweis() {
    return this.incomingVerweise.length > 0;
  }

  get incomingErwaehnungen() {
    return this._incomingVerweise.filter((v) => v.type === 'Erwaehnung');
  }

  get hasIncomingErwaehnung() {
    return this.incomingErwaehnungen.filter((v) => v.type === 'Erwaehnung').length > 0;
  }

  get isOnlyErwaehnung() {
    return this.hasIncomingErwaehnung && this.incomingVerweise.length === this.incomingErwaehnungen.length;
  }

  get carrierFulltitle(): string {
    return this._carrier?.fullTitle || '';
  }

  get firstPageId(): string {
    return this._first_page_id;
  }
}
