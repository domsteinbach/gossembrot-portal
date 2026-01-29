PRAGMA journal_mode = OFF;
PRAGMA synchronous   = OFF;

/* --- tables --- */
DROP TABLE IF EXISTS info_carrier;
CREATE TABLE info_carrier (
                              id              TEXT PRIMARY KEY,
                              df_id           TEXT,
                              title           TEXT,
                              description     TEXT,
                              mat_description TEXT,
                              type            INTEGER,
                              physicality     INTEGER,
                              in_gsmbs_lib    INTEGER,
                              rek_by_joa      TEXT,
                              lib_id          TEXT,
                              sig             TEXT,
                              gnd_id          TEXT,
                              first_page_idx  INTEGER,
                              file_name       TEXT
);

/* === carrier_text ======================================================== */
DROP TABLE IF EXISTS carrier_text;
CREATE TABLE carrier_text (
                              id                TEXT PRIMARY KEY,
                              car_id            TEXT,
                              sort_in_car       INTEGER,
                              title             TEXT,
                              author_id         TEXT,
                              is_lost           INTEGER,   -- 0 available, 1 lost
                              text_range        TEXT,
                              incipit           TEXT,
                              additional_source TEXT,
                              is_author_insecure INTEGER,    -- 0 secure, 1 insecure
                              first_page_id     TEXT
);

/* === page ================================================================ */
DROP TABLE IF EXISTS page;
CREATE TABLE page (
                      id                         TEXT PRIMARY KEY,
                      car_id                     TEXT,     -- carrier id
                      text_id                    TEXT,     -- related text id (if any)
                      sort_in_car                INTEGER,  -- order within carrier
                      p_type                     TEXT,     -- kind of page (cover, insert, etc.)
                      modern_page_num            INTEGER,
                      modern_page_addition       TEXT,
                      folio                      TEXT,     -- r/v
                      page_text                  TEXT,     -- original numbering
                      old_page_num               INTEGER,
                      old_page_addition          TEXT,
                      old_folio                  TEXT,
                      old_page_is_reconstr       TEXT,
                      label                      TEXT,
                      lage                       TEXT,
                      lagen_id                   TEXT,
                      lagen_sym                  TEXT,
                      doppellagen_sym            TEXT,
                      doppellagen_text           TEXT,
                      lagen_text                 TEXT,
                      img_name                   TEXT,
                      img_dir                    TEXT,
                      iiif_info_url              TEXT,
                      is_missing_blatt           INTEGER DEFAULT 0
);

/* === belegstelle ======================================================== */
DROP TABLE IF EXISTS belegstelle;
CREATE TABLE belegstelle (
                             id                      TEXT PRIMARY KEY,
                             car_id                  TEXT,
                             text_id                 TEXT,
                             abschnitt               TEXT,
                             sort_in_car             INTEGER,
                             page_id                 TEXT,
                             wortlaut                TEXT,
                             wortlaut_tei_xml        TEXT,
                             wortlaut_searchstring   TEXT,
                             is_target               INTEGER DEFAULT 0,
                             is_source               INTEGER DEFAULT 1,
                             insecurity              INTEGER DEFAULT 0, -- 0 secure, 1 likely, 2 less likely
                             position_on_page        TEXT,
                             insecure_page           INTEGER,          -- boolean 0/1
                             lost                    INTEGER,          -- boolean 0/1
                             is_fragment             INTEGER,          -- boolean 0/1
                             non_habes               INTEGER,          -- boolean 0/1
                             belegstelle_text        TEXT,
                             alternative_page        TEXT,
                             missing_comment         TEXT,
                             annotat                 TEXT
);

/* === verweis ============================================================ */
DROP TABLE IF EXISTS verweis;
CREATE TABLE verweis (
                         id                TEXT PRIMARY KEY,
                         src_car           TEXT,
                         src_text          TEXT,
                         src_belegstelle   TEXT,
                         target_car        TEXT,
                         target_text       TEXT,
                         target_belegstelle TEXT,
                         type              INTEGER,  -- 0 Verweis, 1 Nennung
                         insecurity        INTEGER DEFAULT 0,  -- 0/1/2
                         general_insecurity INTEGER,
                         bemerkungen       TEXT,
                         file_name         TEXT
);

/* === region ============================================================= */
DROP TABLE IF EXISTS region;
CREATE TABLE region (
                        id            TEXT PRIMARY KEY,
                        img_id        TEXT,
                        belegstelle_id TEXT,
                        page_id       TEXT,
                        created       INTEGER,  -- unix timestamp
                        modified      INTEGER,  -- unix timestamp
                        region        TEXT      -- x1,y1,x2,y2 or Web Annotation fragment
);

/* === author ============================================================= */
DROP TABLE IF EXISTS author;
CREATE TABLE author (
                        id                  TEXT PRIMARY KEY,
                        cognomen            TEXT,
                        relation_to_gsmb    TEXT,
                        gnd_id              TEXT,
                        gnd_id_alternate    TEXT
);

/* === library ============================================================ */
DROP TABLE IF EXISTS library;
CREATE TABLE library (
                         id         TEXT PRIMARY KEY,
                         inst       TEXT,
                         loc        TEXT,
                         gnd_id     TEXT,
                         short_name TEXT
);

/* === naming_gossembrot ================================================== */
DROP TABLE IF EXISTS naming_gossembrot;
CREATE TABLE naming_gossembrot (
                                   id        TEXT PRIMARY KEY,
                                   car_id    TEXT,
                                   benennung TEXT,
                                   source    TEXT
);

/* === imgSrc (note: AUTOINCREMENT id) ==================================== */
DROP TABLE IF EXISTS imgSrc;
CREATE TABLE imgSrc (
                        id             INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_id         TEXT,
                        src_type       INTEGER,  -- 0 external, 1 local
                        info_json_base INTEGER,
                        base_url       TEXT
);

/* === einband ============================================================ */
DROP TABLE IF EXISTS einband;
CREATE TABLE einband (
                         id             TEXT PRIMARY KEY,
                         car_id         TEXT,
                         shelfmark      TEXT,
                         werkstatt      TEXT,
                         werkstatt_desc TEXT,
                         werkzeug       TEXT,
                         werkzeug_desc  TEXT
);

/* === external_entities ================================================== */
DROP TABLE IF EXISTS external_entities;
CREATE TABLE external_entities (
                                   id               TEXT PRIMARY KEY,
                                   obj_id           TEXT,
                                   obj_type         INTEGER,
                                   third_party_id   TEXT,
                                   third_party_link TEXT,
                                   third_party_host TEXT
);

/* === object_type ======================================================== */
DROP TABLE IF EXISTS object_type;
CREATE TABLE object_type (
                             id               TEXT PRIMARY KEY,
                             object_type      INTEGER,
                             object_type_desc TEXT
);

/* === tag ================================================================ */
DROP TABLE IF EXISTS tag;
CREATE TABLE tag (
                     id             TEXT PRIMARY KEY,
                     start_tag      TEXT,
                     end_tag        TEXT,
                     tag_type       INTEGER,
                     description    TEXT,
                     implemented    INTEGER,
                     implemented_as TEXT
);

/* === annotation ========================================================= */
DROP TABLE IF EXISTS annotation;
CREATE TABLE annotation (
                            id                     TEXT PRIMARY KEY,
                            info_carrier           TEXT,
                            blattangabe            TEXT,
                            blattangabe_annotat    TEXT,
                            annotat_text           TEXT,
                            annotat_tei_xml        TEXT,
                            annotat_searchstring   TEXT,
                            bemerkungen            TEXT,
                            carrier_text           TEXT
);

/* === gnd_dump =========================================================== */
DROP TABLE IF EXISTS gnd_dump;
CREATE TABLE gnd_dump (
                          id              TEXT PRIMARY KEY,
                          preferred_name  TEXT,
                          variant_names   TEXT,
                          date_of_birth   TEXT,
                          date_of_death   TEXT,
                          professions     TEXT,
                          places_of_birth TEXT
);

