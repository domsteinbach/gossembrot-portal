// For building static locally with sqlite database baked in
export const environment = {
  production: false,
  name: 'static-local',
  useSqlJs: true,
  gsmbRoot: '/',                          // root when served locally
  apiUrl: '/api',
  defaultDbName: 'gossembrot',
  dbVersion: '2.1',
  localImageBaseUrl: 'http://localhost:4201/',
  osdPrefixUrl: 'images/',
  assetsRoot: 'assets',
};
