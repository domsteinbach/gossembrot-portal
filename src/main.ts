import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

(async () => {
  if (environment.production) {
    enableProdMode();
  }

  platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .then(() => {
        const splash = document.getElementById('app-splash');
        if (splash) {
          splash.classList.add('fade-out');
          setTimeout(() => splash.remove(), 300);
        }
      })
      .catch(err => console.error(err));
})();
