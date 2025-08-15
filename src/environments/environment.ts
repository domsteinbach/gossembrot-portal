// For starting via ng s locally with a local api/local database
export const environment = {
  production: false,
  useSqlJs: false,
  apiUrl: 'http://localhost:3000',
  prefixUrl: '/gossembrot-db/images/', // openseadragon's button images locally: no images folder in dist
  localImageBaseUrl: '/gossembrot-db',
  assetTileSourceBaseUrl: '../',
  defaultDbName: 'gossembrot',
  gsmbRoot: '',
  loggerImagePath: ''
};
