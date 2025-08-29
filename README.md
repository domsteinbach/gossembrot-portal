# Gossembrot-Portal

A project of the Swiss Nationalfonds (2021–2025); Lead: Prof. Dr. Michael Stolz (University of Bern).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17. It uses a mysql database or sqlite for static hosting and a node.js server as api.

## Development
You need a local mysql database running on localhost:3306 - if not, try serve the static version (see below)

### Start the api (local-server.js) locally
- Run `npm run api` to start the api locally in order to connect to a local mysql server running on localhost:3306. Make sure you have a local mysql database running.

### Serve locally
- Run `ng serve` or `ng s` for a dev server. Navigate to `http://localhost:4200/gossembrot-portal/`.

## Build and serve the page locally without a local mysql database (sqlite is used instead)

- Run `npm run serve:static` to build and serve the page. Navigate to `http://localhost:4201/gossembrot-portal/`. The build artifacts are be created in the `dist/gossembrot-portal_static/` directory, so the same used for production hosting with apache webserver (see below).

## Build and host with apache webserver without a mysql database (sqlite is used instead)
- Run `npm run build:static:apache` to build the project for static hosting. The build artifacts will be stored in the `dist/gossembrot-portal_static/` directory.
- Place the content of the "dist" directory (the whole directory "gossembrot-portal_static") onto the server (e.g. in `/var/www/`)
- Make sure the apache webserver is configured to serve the page/directory correctly
- Note the .htaccess file created in the dist/gossembrot-portal_static

## Build and host with a mysql database running
- Run `npm run build:test` or `npm run build:prod` to build the project. The build artifacts will be stored in the `dist/gossembrot-portal` directory.
- Make sure you have a mysql database running
- place and start this api/server.js (via nohub, output to a log file):
  `nohup node server.js > ./server.log 2>&1 &`

Debug:

- Check what's running on port 3000 `lsof -i :3000`
- Check node processes and see if it is in the list `ps aux | grep node`
- Search for server js (there might be another as well) `ps aux | grep server.js`

If you need to kill the process (Be aware you kill the right one of course):
- `kill -9 [PID]` (replace [PID] with the process id)
- in the same terminal disown the process by enter: `disown` (this will prevent the process from being killed when you close the terminal)ß
- See ./server.log for errors

## Data updates for static hosting (sqlite database)

- Change or replace the csv files in src/assets/import
- Increase the version number in the "dbUrl" property in src/environments/environment.*.ts, e.g.: "dbUrl":'/gossembrot-portal_static/assets/db/app.sqlite?v=2.1' to "dbUrl":'/gossembrot-portal_static/assets/db/app.sqlite?v=2.2'
  Otherwise the browser might use a cached version of the sqlite database
- Rebuild the static page (see above). The csv files are imported into the sqlite database during build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Documentation

### Documentation only

Run `npm run compodoc`

### Export projects structure/architecture as PNG

Run `npm run export-structure-png`

### Document and export as PNG

Run `npm run generate-docs`

## Linting & formatting

### Lint

Run `npm run lint`

### Auto format

Run `npm run format`

## Authentication and user management

Authentication and user management is only implemented for the mysql database (not for the sqlite database).
It's sole purpose is feature flagging during development. There are no CUD operations implemented (Create, Update, Delete) anyway.

### Register or Reset a password for a user
- run `npm run registerPassword thePasswordYouLikeToHash`
- then copy the hash (the output of the command; this is the new password hash)
- Go to the database and enter the password hash for the user as password
