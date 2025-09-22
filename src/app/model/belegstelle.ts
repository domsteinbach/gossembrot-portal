import { BelegstelleData } from '../data/repository-model';
import { Page, MissingPageOfExistingCarrier } from './page';
import { GsmbResource } from '../data/repository/gsmb-resource';
import { DisplayVerweis } from './verweis';

export class Belegstelle extends GsmbResource {
  static readonly tableName = 'belegstelle';
  private _carId: string;
  private _sortInCar: number;
  private _textId: string;
  private _isSource: boolean;
  private _isTarget: boolean;
  private _abschnitt: string;
  private _pageId: string;
  private _alternativePageId?: string; // If the page is lost: The page which is closest to the actual page and which should be opened instead
  private _belegstelleText: string;
  private _positionOnPage: string;
  private _insecurity: number; // 0 = secure, 1 = insecure, 2 = more insecure, ...
  private _lost: boolean; // whether the page is lost or there is no carrier available (reconstructed, classics, etc.)
  private _isFragment: boolean;
  private _wortlaut: string; // the original wortlaut from the domain (documents)
  private _wortlaut_tei_xml: string;
  private _wortlaut_searchstring: string;
  private _page?: Page; // The page on which the belegstelle is located
  private _alternativePage?: Page; // If the page is lost: The page which is closest to the actual page and which should be opened instead
  private _missingComment: string;
  outgoingVerweise: DisplayVerweis[] = [];


  constructor(data: BelegstelleData) {
    super(data.id);
    this._carId = data.car_id;
    this._sortInCar = data.sort_in_car;
    this._textId = data.text_id;
    this._abschnitt = data.abschnitt;
    this._pageId = data.page_id;
    this._belegstelleText = data.belegstelle_text;
    this._positionOnPage = data.position_on_page;
    this._isSource = data.is_source === 1;
    this._isTarget = data.is_target === 1;
    this._isFragment = data.is_fragment === 1;
    this._insecurity = data.insecurity;
    this._lost = data.lost === 1; // Whether the page is lost but the carrier is available
    this._wortlaut = data.wortlaut;
    this._wortlaut_tei_xml = data.wortlaut_tei_xml;
    this._wortlaut_searchstring = data.wortlaut_searchstring;
    this._alternativePageId = data.alternative_page;
    this._missingComment = data.missing_comment;
  }

  get carId(): string {
    return this._carId;
  }

  get textId(): string {
    return this._textId;
  }

  get sortInCar(): number {
    return this._sortInCar;
  }

  get isSource(): boolean {
    return this._isSource;
  }

  get isTarget(): boolean {
    return this._isTarget;
  }

  get insecurity(): number {
    return this._insecurity;
  }

  get abschnitt(): string {
    return this._abschnitt;
  }

  get pageId(): string {
    return this._pageId;
  }

  get wortlaut(): string {
    return this._wortlaut;
  }

  get wortlautTeiXml(): string {
    return this._wortlaut_tei_xml;
  }

  get wortlautSearchstring(): string {
    return this._wortlaut_searchstring;
  }

  get lost(): boolean {
    return this._lost;
  }

  get isFragment(): boolean {
    return this._isFragment;
  }

  get page(): Page | undefined {
    return this._page;
  }

  set page(value: Page | undefined) {
    this._page = value;
  }

  get belegstelleText(): string {
    return this._belegstelleText;
  }

  get alternativePageId(): string | undefined {
    return this._alternativePageId;
  }

  get alternativePage(): Page | undefined {
    return this._alternativePage;
  }

  set alternativePage(value: Page | undefined) {
    this._alternativePage = value;
  }

  get missingComment(): string {
    return this._missingComment;
  }

  getPageOrAlternativePage(): Page | undefined {
    return this.alternativePageId ? this.alternativePage : this.page;
  }
}
