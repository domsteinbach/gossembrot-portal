#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const sqlite3 = require("better-sqlite3");
const Papa = require("papaparse");

// resolve project root as one level up from ./tools
const ROOT = path.resolve(__dirname, "..");

const DB_PATH = path.join(ROOT, "src/assets/db/app.sqlite");
const CSV_DIR = path.join(ROOT, "data-import");
const SCHEMA_DIR = path.join(ROOT, "schema");

// 1) fresh DB
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
const db = sqlite3(DB_PATH);

// 2) apply base schema
const schema = fs.readFileSync(path.join(SCHEMA_DIR, "00_schema.sql"), "utf8");
db.exec(schema);

// 3) import CSVs
const csvFiles = fs.readdirSync(CSV_DIR).filter(f => f.endsWith(".csv"));
if (csvFiles.length === 0) {
    console.error("No CSV files found in", CSV_DIR);
}

for (const file of csvFiles) {
    const table = path.basename(file, ".csv");
    console.log(`Importing ${file} → ${table}`);

    const csvText = fs.readFileSync(path.join(CSV_DIR, file), "utf8");
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (parsed.errors.length) {
        console.error("  ! Parse errors:", parsed.errors);
        continue;
    }

    const rows = parsed.data;
    if (!rows.length) {
        console.log("  ! No rows found in CSV. Skipping.");
        continue;
    }

    // check table exists
    const exists = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table);
    if (!exists) {
        console.warn(`  ! Table ${table} not found in schema. Skipping.`);
        continue;
    }

    // get valid columns in the DB table
    const pragma = db.prepare(`PRAGMA table_info(${table})`).all();
    const validCols = pragma.map(p => p.name);

    // filter CSV headers to match table
    const csvCols = Object.keys(rows[0]).filter(c => validCols.includes(c));
    if (csvCols.length === 0) {
        console.warn(`  ! No matching columns between CSV and table ${table}`);
        continue;
    }

    const missingCols = csvCols.filter(h => !validCols.includes(h));
    if (missingCols.length) {
        console.warn(`⚠️  Table '${table}' — ignoring ${missingCols.length} extra CSV column(s): ${missingCols.join(', ')}`);
    }

    const placeholders = csvCols.map(() => "?").join(",");
    const insert = db.prepare(
        `INSERT INTO ${table} (${csvCols.join(",")}) VALUES (${placeholders})`
    );
    const insertMany = db.transaction(data => {
        for (const row of data) {
            insert.run(csvCols.map(c => row[c]));
        }
    });
    insertMany(rows);

    console.log(`  ✓ Inserted ${rows.length} rows into ${table}`);
}

// 4) apply post-import SQL if present
for (const extra of ["02_post_import_tables.sql", "20_indexes.sql"]) {
    const f = path.join(SCHEMA_DIR, extra);
    if (fs.existsSync(f)) {
        console.log(`Applying ${extra} …`);
        db.exec(fs.readFileSync(f, "utf8"));
    }
}

// 5) optimize
db.exec("VACUUM; ANALYZE;");

// 6) row counts
console.log("\nRow counts:");
const tables = db
    .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .all();
for (const t of tables) {
    const cnt = db.prepare(`SELECT COUNT(*) AS c FROM ${t.name}`).get().c;
    console.log(`  ${t.name.padEnd(28)} ${cnt}`);
}
