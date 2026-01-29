// For GitHub Pages (served at https://<user>.github.io/<repo>/)
export const environment = {
  production: true,
  name: 'ghpages',
  useSqlJs: true,
  gsmbRoot: '/gossembrot-portal/',
  apiUrl: './api',
  dbUrl: './assets/db/app.sqlite?v=2.1',
  defaultDbName: 'gossembrot',

  assetsRoot: 'assets',
  osdPrefixUrl: 'images/',
};
