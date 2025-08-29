DROP VIEW IF EXISTS carrier_has_verweis;
CREATE VIEW carrier_has_verweis AS
SELECT
    t.id,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM verweis v
            WHERE v.target_car = t.id
              AND v.insecurity = 0
        ) THEN 1
        ELSE 0
        END AS has_incoming_verweis,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM verweis v
            WHERE v.src_car = t.id
              AND v.insecurity = 0
        ) THEN 1
        ELSE 0
        END AS has_outgoing_verweis
FROM info_carrier t;

-- ===== text_with_verweis =====

DROP VIEW IF EXISTS text_with_verweis;
CREATE VIEW text_with_verweis AS

SELECT *
FROM carrier_text t
WHERE EXISTS (
    SELECT 1
    FROM verweis v
    WHERE v.src_text = t.id
       OR v.target_text = t.id
);

-- ===== Materialized union for LIKE searches =====
DROP TABLE IF EXISTS search_index;
CREATE TABLE search_index (
                              id            TEXT PRIMARY KEY,
                              search_string TEXT,
                              label         TEXT,
                              type          TEXT
);

INSERT INTO search_index (id, search_string, label, type)
SELECT id,
       coalesce(title,'') || '|' || coalesce(mat_description,'') || '|' || coalesce(sig,'') || '|' || coalesce(gnd_id,''),
       title,
       'info_carrier'
FROM info_carrier

UNION ALL
SELECT id,
       coalesce(title,''),
       title,
       'carrier_text'
FROM carrier_text

UNION ALL
SELECT id,
       coalesce(wortlaut_searchstring,''),
       coalesce(wortlaut_tei_xml,''),
       'belegstelle'
FROM belegstelle
WHERE is_source = 1

UNION ALL
SELECT a.id,
       coalesce(a.cognomen,'') || '|' || coalesce(a.gnd_id,'') || '|' ||
       coalesce(g.preferred_name,'') || '|' || coalesce(g.variant_names,''),
       a.cognomen,
       'author'
FROM author a
         LEFT JOIN gnd_dump g ON g.id = a.gnd_id

UNION ALL
SELECT id,
       coalesce(inst,'') || '|' || coalesce(loc,'') || '|' || coalesce(gnd_id,''),
       trim(coalesce(loc,'') || CASE WHEN loc IS NOT NULL AND inst IS NOT NULL THEN ', ' ELSE '' END || coalesce(inst,'')),
       'library'
FROM library

UNION ALL
SELECT id,
       coalesce(benennung,''),
       benennung,
       'naming_gossembrot'
FROM naming_gossembrot
;

CREATE INDEX IF NOT EXISTS idx_search_index_type  ON search_index(type);
CREATE INDEX IF NOT EXISTS idx_search_index_label ON search_index(label);

-- ===== Optional FTS5 virtual table for fast token search =====
-- If your sql.js WASM supports FTS5, this works; if not, we’ll just use LIKE.
DROP TABLE IF EXISTS search_index_fts;
CREATE VIRTUAL TABLE search_index_fts
USING fts5(
  id UNINDEXED,
  search_string,
  label,
  type UNINDEXED,
  tokenize = 'unicode61'
);

INSERT INTO search_index_fts (id, search_string, label, type)
SELECT id, search_string, label, type FROM search_index;
