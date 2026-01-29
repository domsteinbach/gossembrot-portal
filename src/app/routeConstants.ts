import { environment } from "../environments/environment";

export class RouteConstants {
  static readonly GSMB_ROOT = environment.gsmbRoot;

  // Route names for main routes
  static readonly MANUSCRIPTS = "manuscripts";
  static readonly VERWEIS = "verweis";
  static readonly RECONSTRUCTION = "reconstruction";

  static readonly CLASSICS = "classics";
  static readonly AV_TARGETS = "available-targets";
  static readonly HOME = "";
  static readonly ERLAEUTERUNGEN = "erl";
  static readonly TRANSCRIPTION_OVERVIEW = "tags";
  static readonly VISUALISATIONS = "visualisations";
  static readonly FORCE_DIRECTED = "force-directed-graph";

  static readonly DATA_SEARCH = "data-search";
  static readonly DATA_PAGE = "blatt";
  static readonly DATA_SEARCH_SEARCH = "search";
  static readonly DATA_AUTHORS = "author";
  static readonly DATA_CARRIERS = "carrier";
  static readonly DATA_TEXTS = "text";
  static readonly DATA_VERWEISE = "verweis";

  // route params
  static readonly INFO_CARRIER_PARAM = "car";
  static readonly TAG_PARAM = "tag";

  static readonly IN_GSM_VALUE = "in_gsm";
  static readonly OUT_GSM_VALUE = "out_gsm";
  static readonly PRINTS_VALUE = "prints";
  static readonly NON_HABEO_VALUE = "non-habeo";

  // query params
  static readonly QUERY_PAGE_PARAM = "p";
  static readonly QUERY_BELEGSTELLE_PARAM = "b";
  static readonly QUERY_VERWEIS_PARAM = "v";
  static readonly QUERY_CARRIERTEXT_PARAM = "t";
}
