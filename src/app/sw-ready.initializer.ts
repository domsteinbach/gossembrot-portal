import { environment } from '../environments/environment';

function waitForMessage<T = any>(type: string, timeoutMs = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => {
            navigator.serviceWorker.removeEventListener('message', onMsg);
            reject(new Error(`Timeout waiting for ${type}`));
        }, timeoutMs);

        function onMsg(ev: MessageEvent) {
            const data = ev?.data;
            if (data?.type === type) {
                clearTimeout(t);
                navigator.serviceWorker.removeEventListener('message', onMsg);
                resolve(data as T);
            }
        }
        navigator.serviceWorker.addEventListener('message', onMsg);
    });
}

export function waitForSwReadyFactory() {
    return async () => {
        if (!environment.useSqlJs || !('serviceWorker' in navigator)) return;

        const scope = environment.gsmbRoot || '/';
        // Register early
        await navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => {});
        // Wait for an active worker controlling this page
        await navigator.serviceWorker.ready.catch(() => {});

        // Ask SW to ensure DB is loaded and wait for the explicit signal
        const controller = navigator.serviceWorker.controller;
        if (controller) controller.postMessage({ type: 'PING_DB' });

        try {
            await waitForMessage('DB_READY', 15000); // up to 15s on a cold first load
        } catch {
            // Fallback: fail-open (your splash is still visible until app boots)
        }
    };
}
