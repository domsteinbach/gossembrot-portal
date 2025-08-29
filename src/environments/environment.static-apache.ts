// For building a static with sqlite database baked in to run with an apache webserver
export const environment = {
  production: true,
  name: 'static-apache',
  useSqlJs: true,                          // turn on sql.js + SW
  gsmbRoot: '/gossembrot-db_static/',
  apiUrl: '/gossembrot-db_static/api',
  dbUrl: '/gossembrot-db_static/assets/db/app.sqlite?v=1',
  defaultDbName: 'gossembrot',
  localImageBaseUrl: 'http://130.92.252.118:8090/',
};
