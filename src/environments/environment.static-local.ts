// For building static locally with sqlite database baked in
export const environment = {
  production: true,
  name: 'static-local',
  useSqlJs: true,
  gsmbRoot: '/',                          // root when served locally
  apiUrl: '/api',
  dbUrl: '/assets/db/app.sqlite?v=LOCAL', // can keep the same DB file
  defaultDbName: 'gossembrot',
  localImageBaseUrl: 'http://localhost:4201/',
};
