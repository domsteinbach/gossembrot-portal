import { environment } from '../environments/environment';

const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

async function waitForController(maxMs = 4000) {
    if (navigator.serviceWorker.controller) return true;

    const start = performance.now();
    const gotCtrl = new Promise<boolean>((resolve) => {
        function onChange() {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.removeEventListener('controllerchange', onChange);
                resolve(true);
            }
        }
        navigator.serviceWorker.addEventListener('controllerchange', onChange);
    });

    while (performance.now() - start < maxMs) {
        if (navigator.serviceWorker.controller) return true;
        const done = await Promise.race([gotCtrl, sleep(100)]);
        if (done) return true;
    }
    return false; // not controlled yet
}

function waitForMessage(types: string[], timeoutMs = 15000): Promise<{type:string;[k:string]:any}> {
    return new Promise((resolve, reject) => {
        const to = setTimeout(() => {
            navigator.serviceWorker.removeEventListener('message', onMsg);
            reject(new Error(`Timeout waiting for ${types.join(' or ')}`));
        }, timeoutMs);

        function onMsg(ev: MessageEvent) {
            const data = ev?.data;
            if (data && types.includes(data.type)) {
                clearTimeout(to);
                navigator.serviceWorker.removeEventListener('message', onMsg);
                resolve(data);
            }
        }
        navigator.serviceWorker.addEventListener('message', onMsg);
    });
}

export function waitForSwReadyFactory() {
    return async () => {
        if (!environment.useSqlJs || !('serviceWorker' in navigator)) return;

        const scope = environment.gsmbRoot || '/';
        await navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => {});
        await navigator.serviceWorker.ready.catch(() => {});

        // Ensure this page is controlled; if not, do a one-time reload
        const controlled = await waitForController(4000);
        if (!controlled) {
            // avoid loops
            const key = 'SW_RELOAD_ONCE';
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, '1');
                location.reload();
                await new Promise(()=>{}); // never reached
            }
        } else {
            sessionStorage.removeItem('SW_RELOAD_ONCE');
        }

        // Handshake with the SW for DB readiness
        navigator.serviceWorker.controller?.postMessage({ type: 'PING_DB' });
        const msg = await waitForMessage(['DB_READY', 'DB_ERROR'], 20000);
        if (msg.type === 'DB_ERROR') {
            // Option: show a nice error page; for now throw so splash stays
            throw new Error('DB failed to load in SW: ' + (msg['error'] || 'unknown'));
        }
    };
}
