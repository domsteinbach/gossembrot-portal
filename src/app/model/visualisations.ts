import {
  VisualisationNodeLinkData,
  VisualisationVerweisData,
} from '../data/repository-model';

export enum NodeType {
  Carrier = 0,
  Text = 1,
  Belegstelle = 2, // i.e. a belegstelle
}

export class VisualisationVerweis {
  source: string;
  srcType: NodeType;
  srcParent: string | null = null;
  private _src_title: string;
  target: string;
  private _target_title: string;
  targetType: NodeType;
  targetParent: string | null = null;
  value: number;
  rowIndex: number;
  wortlaut_tei_xml: string;

  constructor(data: VisualisationVerweisData) {
    this.source = data.src_id;
    this.srcType = NodeType[data.src_type] as unknown as NodeType;
    this.srcParent = data.src_parent !== '' ? data.src_parent : null;
    this._src_title = data.src_title;
    this.target = data.target_id;
    this._target_title = data.target_title;
    this.targetType = NodeType[data.target_type] as unknown as NodeType;
    this.targetParent = data.target_parent !== '' ? data.target_parent : null;
    this.value = data.number_of_verweise;
    this.rowIndex = data.row_index;
    this.wortlaut_tei_xml = data.wortlaut_tei_xml;
  }

  get srcTitle() {
    // Todo: further
    return this._src_title;
  }

  get targetTitle() {
    return this._target_title;
  }
}

export class VisualisationNodeLink {
  source: string;
  source_type: number;
  target: string;
  target_type: number;

  constructor(data: VisualisationNodeLinkData) {
    this.source = data.source;
    this.source_type = data.source_type;
    this.target = data.target;
    this.target_type = data.target_type;
  }
}

// stored visualisation

// texts

// id
