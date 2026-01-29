import { TagData } from "../data/repository-model";
import { Belegstelle } from "./belegstelle";

export class Tag {
  static readonly tableName = "tag";
  private _id: string;
  private _startTag: string;
  private _endTag: string;
  private _tagType: number;
  private _description: string;
  private _implemented: boolean;
  private _implementedAs: string;
  private _exampleBelegstellen: Belegstelle[] = [];

  constructor(data: TagData) {
    this._id = data.id;
    this._startTag = data.start_tag;
    this._endTag = data.end_tag;
    this._tagType = data.tag_type;
    this._description = data.description;
    this._implemented = data.implemented === 1;
    this._implementedAs = data.implemented_as;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get startTag(): string {
    return this._startTag;
  }

  get endTag(): string {
    return this._endTag;
  }

  get type(): number {
    return this._tagType;
  }

  get description(): string {
    return this._description;
  }

  get implemented(): boolean {
    return this._implemented;
  }

  get implementedAs(): string {
    return this._implementedAs;
  }

  get exampleBelegstellen(): Belegstelle[] {
    return this._exampleBelegstellen;
  }

  set exampleBelegstellen(value: Belegstelle[]) {
    this._exampleBelegstellen = value;
  }

  get hasExampleVerweis(): boolean {
    return this._exampleBelegstellen.length > 0;
  }
}
