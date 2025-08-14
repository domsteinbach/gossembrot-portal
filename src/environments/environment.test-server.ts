// test on dh unibe server & internal port 8090 on dh unibe server
export const environment = {
  production: false,
  apiUrl: '/api', // redirects via proxy to port 3000 where the node server is running
  prefixUrl: '/gossembrot-db/images/', // openseadragon: when building for production, the images are copied to the images folder in dist
  localImageBaseUrl: '../',
  assetTileSourceBaseUrl: '../',
  defaultDbName: 'gossembrot_test',
  gsmbRoot: 'gossembrot-db_test',
  loggerImagePath: ''
};
