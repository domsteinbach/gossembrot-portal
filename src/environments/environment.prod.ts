// prod on dh unibe server & internal port 8090 on dh unibe server
export const environment = {
  production: true,
  name: "prod",
  useSqlJs: false,
  apiUrl: "/api",
  localImageBaseUrl: "../",
  defaultDbName: "gossembrot",
  gsmbRoot: "/gossembrot-portal/",
  assetsRoot: "./assets",
  osdPrefixUrl: "./images/", // for OSD button images
};
