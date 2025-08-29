async function signalDbReady() {
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) c.postMessage({ type: 'DB_READY' });
}

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        await self.clients.claim();
        try {
            await initDb();
            await signalDbReady();        // <— notify controlled pages
        } catch (_) {}
    })());
});

self.addEventListener('message', async (event) => {
    if (!event || !event.data) return;
    if (event.data.type === 'PING_DB') {
        try {
            await initDb();
            event.source?.postMessage?.({ type: 'DB_READY' }); // reply to the sender
        } catch (e) {
            event.source?.postMessage?.({ type: 'DB_ERROR', error: String(e?.message || e) });
        }
    }
});


const SCOPE  = (self.registration && self.registration.scope) || new URL('./', self.location.href).toString();
const scoped = (p) => new URL(p, SCOPE).toString();

// bump this when you publish a new DB
const DB_URL = 'assets/db/app.sqlite?v=2';

/* --- load sql.js at parse/install time (required by SW rules) --- */
importScripts(scoped('assets/sqljs/sql-wasm.js'));
const SQL_READY = initSqlJs({
    locateFile: (f) => scoped(`assets/sqljs/${f}`)
});

/* --- lifecycle --- */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* --- lazy-open DB --- */
let dbPromise;
async function initDb() {
    if (dbPromise) return dbPromise;
    const SQL  = await SQL_READY;
    const resp = await fetch(scoped(DB_URL), { cache: 'force-cache' });
    const buf  = await resp.arrayBuffer();
    const db   = new SQL.Database(new Uint8Array(buf));
    dbPromise  = Promise.resolve(db);
    return dbPromise;
}

/* --- paths inside scope --- */
const scopeRootPath = new URL('.', SCOPE).pathname;    // e.g. "/gossembrot-portal_static/"
const apiPath       = new URL('api', SCOPE).pathname;  // e.g. "/gossembrot-portal_static/api"
const loginPath     = new URL('login', SCOPE).pathname;
const updatePath    = new URL('update', SCOPE).pathname;

/* --- fetch handler --- */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // intercept same-origin POSTs to /<scope>/api
    // (temporarily also accept POSTs to the scope root for safety)
    const isSqlPost =
        url.origin === location.origin &&
        request.method === 'POST' &&
        (url.pathname === apiPath || url.pathname === scopeRootPath); // remove root later

    const isLogin  = url.origin === location.origin && request.method === 'POST' &&
        url.pathname === loginPath;
    const isUpdate = url.origin === location.origin &&
        (request.method === 'PUT' || request.method === 'POST') &&
        url.pathname === updatePath;

    if (!(isSqlPost || isLogin || isUpdate)) return;

    event.respondWith((async () => {
        try {
            if (isLogin || isUpdate) {
                return new Response(JSON.stringify({ error: 'Forbidden in static build' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Debug trace so you can confirm interception in DevTools
            // (remove once stable)
            // eslint-disable-next-line no-console
            console.log('[SW] intercept', request.method, url.pathname, 'scope=', scopeRootPath);

            const { query, data } = await request.clone().json();
            if (typeof query !== 'string' || !query.trim()) {
                return new Response(JSON.stringify({ error: 'Bad Request' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }
            if (/(^|\W)users(\W|$)/i.test(query)) {
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
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'Internal Server Error', details: String(e && e.message || e) }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    })());
});
