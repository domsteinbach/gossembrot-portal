// For starting via ng s locally with a local api/local database
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  prefixUrl: '/gossembrot-db/images/', // openseadragon's button images locally: no images folder in dist
  localImageBaseUrl: 'http://130.92.252.118:8090/',
  assetTileSourceBaseUrl: 'http://localhost:4200/',
  defaultDbName: 'gossembrot',
  gsmbRoot: 'gossembrot-db',
  loggerImagePath: ''
};
