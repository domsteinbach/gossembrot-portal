import { environment } from '../environments/environment';

export class EnvConstants {
  static readonly ASSET_IMG_PATH = `${environment.assetTileSourceBaseUrl}${environment.gsmbRoot}/assets/img`;
  static readonly LAGENSYM_BASE_PATH = `${environment.assetTileSourceBaseUrl}${environment.gsmbRoot}/assets/Lagensymbole`;
  static readonly NULL_IMG_PATH = `${this.ASSET_IMG_PATH}/transparent.svg`; // for resetting viewer
  static readonly NOT_FOUND_IMG_PATH = `${this.ASSET_IMG_PATH}/NotFound.png`; // for technically not found images
  static readonly BLATT_OF_MISSING_CARRIER_PATH = `${this.ASSET_IMG_PATH}/lost.jpg`; // for lost belegstellen, lost pages onto which a verweis is pointing
  static readonly MISSING_BLATT_OF_EXISTING_CARRIER_PATH_R = `${this.ASSET_IMG_PATH}/missing_leaf_r.jpg`; // All other missing images whose physical page might or might not exist
  static readonly MISSING_BLATT_OF_EXISTING_CARRIER_PATH_V = `${this.ASSET_IMG_PATH}/missing_leaf_v.jpg`; // All other missing images whose physical page might or might not exist
  static readonly LOCAL_IMG_FALLBACK_DIR = `${environment.localImageBaseUrl}`; // for local images, e.g. in debug mode
  static readonly GND_BASEURL = 'https://d-nb.info/gnd/'; // https://d-nb.info/gnd/11921587X
}
