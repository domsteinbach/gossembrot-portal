import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if ('serviceWorker' in navigator && environment.useSqlJs) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${environment.gsmbRoot}sw.js`, { scope: environment.gsmbRoot });
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
