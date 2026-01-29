import { PageType } from '../model/page';

export interface InformationCarrierData {
  id: string;
  df_id: string;
  title: string;
  description: string;
  mat_description: string;
  type: number;
  physicality: number; // 0 = 'available', 1 = 'lost', 2 = 'classic'
  in_gsmbs_lib: number;
  rek_by_joa: string;
  lib_id: string;
  sig: string;
  file_name: string;
  first_page_idx: number;
  has_incoming_verweis: number;
  has_outgoing_verweis: number;
}

export interface LibraryData {
  id: string;
  gnd_id: string;
  inst: string;
  loc: string;
  short_name: string;
}

export interface CarrierTextData {
  author_id: string;
  cognomen: string;
  car_id: string;
  is_lost: number;
  id: string;
  sort_in_car: number;
  title: string;
  longTitle: string;
  text_range: string;
  incipit: string;
  additional_source: string; // e.g. '[aus Clm 26346]'
  is_author_insecure: number; // 0 = 'no', 1 = 'yes'
  first_page_id: string;
}

export interface PageData {
  car_id: string;
  folio: string; // 'r' or 'v'
  img_dir: string;
  external_img_url: string;
  iiif_info_url: string;
  local_img_is_corrupt: number; // 0 = 'no', 1 = 'yes'
  autocompared_iiif: number; // 0 = 'no', 1 = 'yes'
  match_percentage: number; // 0-100
  img_name: string;
  label: string;
  lage: string;
  lagen_id: string;
  lagen_sym: string;
  lagen_text: string;
  doppellagen_sym: string;
  doppellagen_text: string;
  modern_page_addition: string;
  modern_page_num: number;
  old_folio: string;
  old_page_addition: string;
  old_page_is_reconstr: number;
  old_page_num: number;
  p_type: PageType;
  page_text: string;
  id: string;
  sort_in_car: number;
  text_id: string;
  manually_defined_info_json: number;  // 0 = 'no', 1 = 'yes'
  is_missing_blatt: number; // 0 = 'no', 1 = 'yes'
}

// equals the data stored in the belegstelle table and can be used to update data
export interface BelegstelleData {
  id: string;
  car_id: string;
  sort_in_car: number;
  text_id: string;
  abschnitt: string;
  page_id: string;
  belegstelle_text: string;
  position_on_page: string;
  is_source: number;
  is_target: number;
  insecurity: number;
  lost: number;
  is_fragment: number;
  wortlaut: string;
  wortlaut_tei_xml: string;
  wortlaut_searchstring: string;
  alternative_page: string;
  missing_comment: string;
}

export interface VerweisData {
  type: number; // 0 = 'Erwaehnung', 1 = 'Verweis
  file_name: string;
  id: string;
  insecurity: number;
  general_insecurity: number;
  src_belegstelle: string;
  src_car: string;
  src_text: string;
  target_belegstelle: string;
  target_car: string;
  target_text: string;
  bemerkungen: string;
}

export interface VisualisationVerweisData {
  src_id: string;
  src_type: number;
  src_title: string;
  src_parent: string;
  target_id: string;
  target_title: string;
  target_type: number;
  target_parent: string;
  number_of_verweise: number;
  row_index: number;
  wortlaut_tei_xml: string;
  wortlaut_searchstring: string;
}

// links between nodes which are not a verweis, i.e. for linking texts to carriers or belegstellen to texts
export interface VisualisationNodeLinkData {
  source: string;
  source_type: number;
  target: string;
  target_type: number;
}

export interface InfoCarrierHitlistData {
  infocar: string;
  bodycount: number;
  total_verweise_involved: number;
  got_hit: number;
  self_shots: number;
  distinct_victims: number;
  distinct_perpetrators: number;
}

export interface TagData {
  id: string;
  start_tag: string;
  end_tag: string;
  tag_type: number;
  description: string;
  implemented: number;
  implemented_as: string;
}

export interface GndAuthorData {
  id: string;
  preferred_name: string;
  variant_names: string;
  date_of_birth: string;
  date_of_death: string;
  professions: string;
  places_of_birth: string;
}

export interface SearchResultData {
  id: string;
  search_string: string;
  label: string;
  type: string,
}
