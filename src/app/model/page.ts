import { PageData } from '../data/repository-model';
import { GsmbResource } from '../data/repository/gsmb-resource';
import { EnvConstants } from '../constants';

export type Folio = 'r' | 'v';

export type PageType =
  | 'CommonLeaf'
  | 'LeafWithRomanNumeral'
  | 'BindingInside'
  | 'Einlegeblatt'
  | 'Zwischenblatt'
  | 'Makulaturblatt'
  | 'Vorsatzblatt'
  | 'Pergament'
  | 'Cedula'
  | 'Zettel'
  | 'Schnitt'
  | 'BindingOutside'
  | 'Spine';

export class Page extends GsmbResource {
  protected _carId: string;
  protected _folio: Folio;
  protected _imgDir: string;
  protected _externalImgUrl: string;
  protected _iiifInfoUrl: string;
  protected _imgName: string;
  protected _label: string;
  protected _lage: string;
  protected _lagenId: string;
  protected _lagenSym: string;
  protected _lagenText: string;
  protected _doppellagenSym: string;
  protected _doppellagenText: string;
  protected _modernPageAddition: string;
  protected _modernPageNum: number;
  protected _oldFolio: string;
  protected _oldPageAddition: string;
  protected _oldPageIsReconstr: boolean;
  protected _oldPageNum: number;
  protected _pType: PageType;
  protected _pageText: string;
  protected _sortInCar: number;
  protected _textId: string;
  protected _localImgIsCorrupt: boolean;
  protected _autocomparedIiif: boolean;
  protected _matchPercentage: number;
  protected _manuallyAddedIiif = false; // Indicates if the IIIF info was manually added
  protected _isMissingBlatt = false; // Indicates if the page is a missing Blatt

  constructor(pageData: PageData) {
    super(pageData.id);
    this._carId = pageData.car_id;
    this._folio = pageData.folio as Folio;
    this._externalImgUrl = pageData.external_img_url;
    this._imgDir = pageData.img_dir;
    this._iiifInfoUrl = pageData.iiif_info_url;
    this._imgName = pageData.img_name;
    this._label = pageData.label;
    this._lage = pageData.lage;
    this._lagenId = pageData.lagen_id;
    this._lagenSym = pageData.lagen_sym;
    this._lagenText = pageData.lagen_text;
    this._doppellagenSym = pageData.doppellagen_sym;
    this._doppellagenText = pageData.doppellagen_text;
    this._modernPageAddition = pageData.modern_page_addition || '';
    this._modernPageNum = pageData.modern_page_num;
    this._oldFolio = pageData.old_folio;
    this._oldPageAddition = pageData.old_page_addition;
    this._oldPageIsReconstr = pageData.old_page_is_reconstr === 0;
    this._oldPageNum = pageData.old_page_num;
    this._pType = pageData.p_type;
    this._pageText = pageData.page_text;
    this._sortInCar = pageData.sort_in_car;
    this._textId = pageData.text_id;
    this._localImgIsCorrupt = pageData.local_img_is_corrupt === 1;
    this._autocomparedIiif = pageData.autocompared_iiif === 1;
    this._matchPercentage = pageData.match_percentage || 0;
    this._manuallyAddedIiif = pageData.manually_defined_info_json === 1;
    this._isMissingBlatt = pageData.is_missing_blatt === 1;
  }

  get carId(): string {
    return this._carId;
  }

  get folio(): Folio {
    return this._folio;
  }

  get oppositeFolio(): Folio {
    // return the opposite folio, so r when v and vice versa
    if (this._folio === 'r') {
      return 'v';
    } else {
      return 'r';
    }
  }

  get imgDir(): string {
    if ( this.isMissingBlatt) {
      return this.folio === 'v' ? EnvConstants.MISSING_BLATT_OF_EXISTING_CARRIER_PATH_V : EnvConstants.MISSING_BLATT_OF_EXISTING_CARRIER_PATH_R;
    }  else {
      return this._imgDir;
    }
  }

  get isMissingBlatt(): boolean {
    return this._isMissingBlatt;
  }



  get externalImgUrl(): string {
    return this._externalImgUrl;
  }

  get iiifInfoUrl(): string {
    return this._iiifInfoUrl;
  }

  get autocomparedIiif(): boolean {
    return this._autocomparedIiif;
  }

  get localImgIsCorrupt(): boolean {
    return this._localImgIsCorrupt;
  }

  get matchPercentage(): number {
    return this._matchPercentage;
  }

  get manuallyAddedIiif(): boolean {
    return this._manuallyAddedIiif;
  }

  get label(): string {
    return this._label;
  }

  get lagenSym(): string {
    return this._lagenSym;
  }

  get lagenText(): string {
    return this._lagenText;
  }

  get doppellagenSym(): string {
    return this._doppellagenSym;
  }

  get doppellagenText(): string {
    return this._doppellagenText;
  }

  get textId(): string {
    return this._textId;
  }

  get idx() {
    return this._sortInCar;
  }

  get isDisplayedAsSingleImage(): boolean {
    return this._pType === 'BindingOutside' || this._pType ===  'Schnitt' || this._pType === 'Spine' || this._pType === 'Cedula' || this._pType === 'Zettel';
  }

  get pageText(): string {
    return this._pageText;
  }

  get pageType(): string {
    return this._pType;
  }
}

// a page with no image, to be used when the image is missing
export class BlindDoublePageFolio extends Page {
  constructor(folio: Folio) {
    const pageData = emptyPageData;
    pageData.id = UuId.generateUuid();
    pageData.folio = folio;
    super(pageData);
  }

  override get imgDir() {
    return EnvConstants.NULL_IMG_PATH
  }
}

// a page to be displayed to reset until a new page with image is loaded
export class NullPage extends Page {
  constructor() {
    const pageData = emptyPageData;
    pageData.id = UuId.generateUuid();
    pageData.img_dir = EnvConstants.NULL_IMG_PATH;
    super(pageData);
  }
}

// a page to be displayed when a page is referred to by a verweis but the carrier is lost or there is no carrier available
export class PageOfMissingCarrier extends Page {
  constructor() {
    const pageData = emptyPageData;
    pageData.id = UuId.generateUuid();
    pageData.img_dir = EnvConstants.BLATT_OF_MISSING_CARRIER_PATH;
    pageData.lagen_sym = '';

    super(pageData);
  }
}

// a page to be displayed when a page is referred to by a verweis but the carrier is lost or there is no carrier available
export class MissingPageOfExistingCarrier extends Page {
  constructor(folio: Folio = 'r') {
    const pageData = emptyPageData;
    pageData.id = UuId.generateUuid();
    pageData.img_dir = folio === 'v' ? EnvConstants.MISSING_BLATT_OF_EXISTING_CARRIER_PATH_V : EnvConstants.MISSING_BLATT_OF_EXISTING_CARRIER_PATH_R;
    pageData.lagen_sym = '';
    super(pageData);
  }
}

class UuId {
  static generateUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export const emptyPageData: PageData = {
  car_id: '',
  folio: 'r',
  img_dir: '',
  external_img_url: '',
  iiif_info_url: '',
  img_name: '',
  label: '',
  lage: '',
  lagen_id: '',
  lagen_sym: '',
  lagen_text: '',
  doppellagen_sym: '',
  doppellagen_text: '',
  modern_page_addition: '',
  modern_page_num: 0,
  old_folio: '',
  old_page_addition: '',
  old_page_is_reconstr: 0,
  old_page_num: 0,
  p_type: 'CommonLeaf',
  page_text: '',
  id: '',
  sort_in_car: 0,
  text_id: '',
  local_img_is_corrupt: 0,
  autocompared_iiif: 0,
  match_percentage: 0,
  manually_defined_info_json: 0, // 0 = 'no', 1 = 'yes',
  is_missing_blatt: 0 // 0 = 'no', 1 = 'yes'
};
