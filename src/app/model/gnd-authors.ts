import { GndAuthorData } from "../data/repository-model";
import { EnvConstants } from "../constants";
import { GsmbResource } from "../data/repository/gsmb-resource";

export class GndAuthor extends GsmbResource {
  static readonly tableName = "einband";

  private _preferredName: string;
  private _variantNames: string;
  private _dateOfBirth?: string;
  private _dateOfDeath?: string;
  private _placesOfBirth?: string;
  private _professions?: string;

  constructor(data: GndAuthorData) {
    super(data.id);
    this._preferredName = data.preferred_name;
    this._variantNames = data.variant_names;
    this._dateOfBirth = data.date_of_birth;
    this._dateOfDeath = data.date_of_death;
    this._placesOfBirth = data.places_of_birth;
    this._professions = data.professions;
  }

  get gndId(): string {
    return this._id;
  }

  get preferredName(): string {
    return this._preferredName;
  }

  get variantNames() {
    return this._variantNames;
  }

  get dateOfBirth() {
    return this._dateOfBirth;
  }

  get dateOfDeath() {
    return this._dateOfDeath;
  }

  get placesOfBirth() {
    return this._placesOfBirth;
  }

  get professions(): string | undefined {
    return this._professions;
  }

  get linkToGnd(): string {
    return this._id ? `${EnvConstants.GND_BASEURL}${this._id}` : "";
  }
}
