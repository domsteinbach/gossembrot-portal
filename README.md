# Gossembrot-Portal

A project of the Swiss Nationalfonds (2021–2025); Lead: Prof. Dr. Michael Stolz (University of Bern);
Project staff:
- Dr. Ioanna Georgiou (University of Bern)
- Elena Brandazza MA (University of Bern)
- Development and Design by Dominique Steinbach (University of Bern) https://github.com/domsteinbach.

In order to be long term available and to minimise platform dependencies the project implements two different database technologies depending on the desired environment. It can be either hosted alongside a mysql database (with a node.js server as api) or as a static hosted website with SQLite compiled to WebAssembly (sqlite3 & sql.js).

The main projects page is deployed at https://gossembrot.unibe.ch/gossembrot-portal. A static version of the page is available at: https://domsteinbach.github.io/gossembrot-portal-site/. The static version is built and deployed automatically on every push to the main branch via github actions (.github/workflows/deploy-gh-pages.yml)

# Prerequisites

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17. 

- Make sure you have node.js installed (v18 or higher)
- Make sure you have angular cli installed globally: `npm install -g @angular/cli`
- Run `npm install` to install the dependencies
 
# Build and serve options

There are two major ways to build and serve the page:

- Static: Build and serve using sqlite3 and sql.js. All data is baked into the build.
- Dynamic: Build & host alongside a mysql database and a node.js server as api

The static way is recommended as building and hosting the page as it is much easier to set up and maintain. It is also the way the page is hosted on github pages (https://domsteinbach.github.io/gossembrot-portal-site/).

## A. Static: Build and serve without a mysql database (using sqlite3 and sql.js instead)

- Make sure you have the sqlite3 package installed globally: `npm install -g sqlite3`

### 1.) Local build and serve the static page with baked in database

To serve the page with live reload (changes to the code will be reflected immediately)
- Run `npm run static:watch` to import the data to the build and serve the page at http://localhost:4201/. Changes to the code will be reflected and the browser reloads without rebuilding the whole project (but it might still take some time).

For proper development with live reload use the mysql database and the node.js server as api (see below).


### 2.) Build and host the static page with an apache webserver
- Run `npm run build:static:apache` to build the project for static hosting. The build artifacts will be stored in the `dist/gossembrot-portal_static/` directory.
- Place the content of the "dist" directory (the whole directory "gossembrot-portal_static") onto the server (e.g. in `/var/www/`)
- Make sure the apache webserver is configured to serve the page/directory correctly
- Note the .htaccess file created in the dist/gossembrot-portal_static

### 3.) Data imports & updates for static hosting (sqlite database)

- Change or replace the csv files in `./data-import`
- Increase the version number in the "dbUrl" property in src/environments/environment.*.ts, e.g.: "dbUrl":'/gossembrot-portal_static/assets/db/app.sqlite?v=2.1' to "dbUrl":'/gossembrot-portal_static/assets/db/app.sqlite?v=2.2'
  Otherwise the browser might use a cached version of the sqlite database
- Run `npm run db:build ` to rebuild the database and import (see above) for local development or rebuild the whole project for static hosting e.g. with `npm run build:static:apache` (see above)
- commit and push the changes to the main branch (auto deployed to github pages)

## B. Dynamic: Build & host alongside a mysql database and a node.js server as api

### 1.) local development

### Prerequisites
- Make sure you have a local mysql database running on localhost:3306
- Create a database "gossembrot" on your local mysql server
- Import the csv files found in "./data-import" into the database (as the data is generated from different project sources, the data is not available in a single sql dump file).

### Serve locally
- Run `npm run api` to start the api locally in order to connect to a local mysql server running on localhost:3306. Make sure your mysql database is running.
- Run `ng serve` or `ng s` for a dev server. Navigate to `http://localhost:4200/gossembrot-portal/`.

### 2.) Build and host with a mysql database

#### Prerequisites
- Make sure you have node.js installed (v18 or higher)
- Make sure you have a mysql database running on the server
- Create a database "gossembrot" in your mysql server (or change the db name in server.js and in src/environments/environment.*.ts accordingly)
- Import the csv files found in "./data-import" into the database (as the data is generated from different project sources, the data is not available in a single sql dump file).

The default host and port for mysql is localhost:3306. If your mysql database is running on a different host or port, change the host and port in server.js and in src/environments/environment.*.ts accordingly.
The database name ("gossembrot" or "gossembrot_test") is defined in server.js and in src/environments/environment.*.ts accordingly.

- put the node server ./api/server.js onto the server (e.g. in /var/www/gsmb/api/)
- run `npm install` to install the dependencies

#### Build and host

- Run `npm run build:test` or `npm run build:prod` to build the project. The build artifacts will be stored in the `dist/gossembrot-portal` directory.
- Make sure you have the mysql database running on the server at the specified host and port
- start the server.js (via nohub, output to a log file):
  `nohup node server.js > ./server.log 2>&1 &`
- in the same terminal disown the process by enter: `disown` (this will prevent the process from being killed when you close the terminal)ß
- Make sure the user running the node.js server has access to the node_modules directory
- Navigate to `http://your-server/gossembrot-portal/`.

Hints for debugging if the server.js does not start or the page does not load:

- Check what's running on port 3000 `lsof -i :3000`
- Check node processes and see if it is in the list `ps aux | grep node`
- Search for server js `ps aux | grep server.js`

If you need to kill the process:
- `kill -9 [PID]` (replace [PID] with the process id)
- See ./server.log for errors

# Other scripts and commands

## Documentation

### Create Documentation

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

## Authentication and user management (only for mysql database && local development)

Authentication and user management is only implemented for the mysql database (not for the sqlite database).
It's sole purpose is feature flagging during development. There are no CUD operations implemented (Create, Update, Delete) anyway.

### Register or Reset a password for a user
- run `npm run registerPassword thePasswordYouLikeToHash`
- then copy the hash (the output of the command; this is the new password hash)
- Go to the database and enter the password hash for the user as password
