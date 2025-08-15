/* src/static/sw.js — sql.js + subpath-safe */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

let dbPromise;

function scoped(path) {
    // Ensures assets resolve under the SW’s scope (works at / or /repo/)
    const scope = self.registration?.scope || '/';
    return new URL(path, scope).toString();
}

/** init the in-memory SQLite DB from assets/db/app.sqlite */
async function initDb() {
    if (dbPromise) return dbPromise;

    // sql.js exposes initSqlJs via the file we copy to assets/sqljs
    importScripts(scoped('assets/sqljs/sql-wasm.js'));
    const SQL = await initSqlJs({
        locateFile: (f) => scoped(`assets/sqljs/${f}`) // finds sql-wasm.wasm
    });

    const resp = await fetch(scoped('assets/db/app.sqlite?v=1'), { cache: 'force-cache' });
    const buf = await resp.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buf));

    dbPromise = Promise.resolve(db);
    return dbPromise;
}

function isUsersTable(sql) {
    return /(^|\W)users(\W|$)/i.test(sql);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Intercept same-origin:
    const sameOrigin = url.origin === location.origin;

    const isSqlPost = sameOrigin && request.method === 'POST' && url.pathname === new URL('.', self.registration.scope).pathname;
    // Equivalent to path "<scope>" (e.g., "/" or "/gossembrot-db/")

    const loginPath  = new URL('login', self.registration.scope).pathname;
    const updatePath = new URL('update', self.registration.scope).pathname;

    const isLogin  = sameOrigin && request.method === 'POST' && url.pathname === loginPath;
    const isUpdate = sameOrigin && (request.method === 'PUT' || request.method === 'POST') && url.pathname === updatePath;

    if (!(isSqlPost || isLogin || isUpdate)) return;

    event.respondWith((async () => {
        try {
            if (isLogin || isUpdate) {
                return new Response(JSON.stringify({ error: 'Forbidden in static build' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            const { query, data } = await request.clone().json();
            if (typeof query !== 'string' || !query.trim()) {
                return new Response(JSON.stringify({ error: 'Bad Request' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }
            if (isUsersTable(query)) {
                return new Response(JSON.stringify({ error: 'Forbidden' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            const db = await initDb();

            const rows = [];
            const stmt = db.prepare(query);
            try {
                stmt.bind(Array.isArray(data) ? data : []);
                while (stmt.step()) rows.push(stmt.getAsObject());
            } finally {
                stmt.free();
            }

            return new Response(JSON.stringify(rows), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(e && e.message || e) }), {
                status: 500, headers: { 'Content-Type': 'application/json' }
            });
        }
    })());
});
