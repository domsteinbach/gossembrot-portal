// For starting via ng s locally with a local api/local database
export const environment = {
  production: true,
  name: 'static',
  useSqlJs: true,                          // turn on sql.js + SW
  apiUrl: './',                             // SW intercepts POST '/'
  dbUrl: '/assets/db/app.sqlite?v=1',      // bump v= when you publish new data
  prefixUrl: '/gossembrot-db/images/',
  localImageBaseUrl: 'http://130.92.252.118:8090/',
  assetTileSourceBaseUrl: './',
  defaultDbName: 'gossembrot',
  gsmbRoot: './',
  loggerImagePath: ''
};
