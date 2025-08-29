# GossembrotDb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16

## Development server with a mysql database running locally
You need a local mysql database running on localhost:3306 - if not, try serve the static version (see below)

### Start the api (local-server.js) locally
Run `npm run api` to start the api locally in order to connect to a local mysql server running on localhost:3306. Make sure you have a local mysql database running.
### Serve locally
Run `ng serve` or `ng s` for a dev server. Navigate to `http://localhost:4200/gossembrot-db/`. 

## Build and serve page locally without a local mysql database (sqlite is used instead)
Run `npm run serve:static` to build and serve the static files on port 4201. Navigate to `http://localhost:4201/gossembrot-db/`. (The build artifacts are created in `dist/gossembrot-db_static/`.)
Run `npm run build:static:local` to build the project for static hosting. The build artifacts are created in `dist/gossembrot-db_static/`. It is not served automatically.

## Build a static page for production hosting without a mysql database (sqlite is used instead)
- Run `npm run build:static-apache` to build the project for static hosting. The build artifacts will be stored in the `dist/gossembrot-db_static/` directory.
- Place the content of the "dist" directory (the whole directory "gossembrot-db_static") onto the server (e.g. in `/var/www/`)


## Build for production hosting with a mysql database
- Run `npm run build:test` or `npm run build:prod` to build the project. The build artifacts will be stored in the `dist/` directory.


### Deploy on prod

- Place the content of the "dist" directory (the whole directory "gossembrot-db") onto the server
- If there are changes in server.js, replace the server.js file from the root project directory in `/var/www/mysql-server-gsmb` and restart the server (see below)

### Start node server (mysql api) on production

The server.js file from the root project directory is placed in `/var/www/mysql-server-gsmb`

To see if process is already running, you can:

- Check what's running on port 3000 `lsof -i :3000`
- Check node processes and see if it is in the list `ps aux | grep node`
- Search for server js (there might be another as well) `ps aux | grep server.js`

If you need to kill the process (Be aware you kill the right one of course):
- `kill -9 [PID]` (replace [PID] with the process id)

- Start the server (via nohub, so it is not killed when you close the terminal and it writes the output to a log file):
`nohup node server.js > ./server.log 2>&1 &` (after cd into the directory where the server.js file is located)
- check if the website displays data
- in the same terminal disown the process by enter: `disown` (this will prevent the process from being killed when you close the terminal)ß

Trouble shooting:
- check the LOG file ./server.log for errors

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

### Resetting a password for a user
- run here `npm run registerPassword thePasswordYouLikeToHash`
- then copy the hash (the output of the command; this is the new password hash)
- Go to the database and enter the password hash for the user as password
