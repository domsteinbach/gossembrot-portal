// prod on dh unibe server & internal port 8090 on dh unibe server
export const environment = {
  production: true,
  name: 'prod',
  useSqlJs: false,
  apiUrl: '/api', // redirects via proxy to port 3000 where the node server is running
  localImageBaseUrl: '../',
  defaultDbName: 'gossembrot',
  gsmbRoot: 'gossembrot-db',
};
