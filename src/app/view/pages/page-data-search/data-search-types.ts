import { DisplayVerweis } from '../../../model/verweis';
import { Belegstelle } from '../../../model/belegstelle';
import { InformationCarrier } from '../../../model/infoCarrier';
import { DisplayCarrierText } from '../../../model/carriertext';
import { Author } from '../../../model/author';
import { Page } from '../../../model/page';
import { PrimitiveDataType } from './page-verweis-search/search.types';
import { GndAuthor } from '../../../model/gnd-authors';

export type TableName = 'verweis' | 'text' | 'author' | 'page';

type VerweisColumn =
  | keyof DisplayVerweis
  | keyof Belegstelle
  | keyof InformationCarrier;

export type Column = VerweisColumn | keyof DisplayCarrierText | keyof Author | keyof GndAuthor | keyof Page | 'srcTextAuthor' | 'targetTextAuthor' | 'gndData.dateOfBirth';

export interface ColumnDef {
  column: Column; // define the column name; subobjects are allowed, e.g. gndData.dateOfBirth, but only one level deep
  displayedName: string;
  primitiveType: PrimitiveDataType;
  displayed: boolean;
  displayFilter?: boolean;
  nullOrEmptyFilter?: boolean;
  customFilter?: boolean;
}

export interface BooleanControl {
  checkboxValue: boolean;
  value: any;
  label: string;
}

export interface NullFilter {
  column: ColumnDef;
  showNullValues: boolean;
  showNonNullValues: boolean;
}
