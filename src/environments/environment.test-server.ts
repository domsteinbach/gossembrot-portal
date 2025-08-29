// test on dh unibe server & internal port 8090 on dh unibe server
export const environment = {
  production: false,
  name: 'test-server',
  useSqlJs: false,
  apiUrl: '/api', // redirects via proxy to port 3000 where the node server is running
  localImageBaseUrl: '../',
  defaultDbName: 'gossembrot_test',
  gsmbRoot: 'gossembrot-portal_test',
  assetsRoot: './assets',
  osdPrefixUrl: './images/', // for OSD button images

};
