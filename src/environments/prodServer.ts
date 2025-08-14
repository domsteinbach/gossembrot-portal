// For starting locally on port 4200 but connect to prod server/api.
export const environment = {
  production: false,
  apiUrl: 'http://130.92.252.118/api',
  prefixUrl: '/gossembrot-db/images/', // openseadragon locally: no images folder in dist
  lagensymbolBaseUrl:
    'http://130.92.252.118:8090/hssfaks/Lagensymbole/Doppelseite/',
  localImageBaseUrl: 'http://130.92.252.118:8090/',
};
