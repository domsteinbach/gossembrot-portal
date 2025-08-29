import { environment } from '../environments/environment';

export function waitForSwReadyFactory() {
    return () => {
        if (!environment.useSqlJs || !('serviceWorker' in navigator)) {
            return Promise.resolve();
        }
        // Register at the app scope and wait until it controls the page
        const scope = environment.gsmbRoot || '/';
        return navigator.serviceWorker.register(`${scope}sw.js`, { scope })
            .then(() => navigator.serviceWorker.ready) // active + controlling on next nav
            .catch(() => void 0); // fail open: app still runs (will hit real API if any)
    };
}
