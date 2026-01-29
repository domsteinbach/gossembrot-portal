// For GitHub Pages (served at https://<user>.github.io/<repo>/)
export const environment = {
  production: true,
  name: 'ghpages',
  useSqlJs: true,
  gsmbRoot: '',
  apiUrl: './api',
  dbUrl: './assets/db/app.sqlite?v=2.0',
  defaultDbName: 'gossembrot',

  assetsRoot: 'assets',
  osdPrefixUrl: 'images/',
};
