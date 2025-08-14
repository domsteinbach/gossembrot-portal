const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { version: packageVersion } = require('../package.json');

console.log('Running set-version.js script');

const targetPath = join(__dirname, '..', 'src', 'environments', 'version.ts');

let currentVersion = '0.0.0';

// Read the current version from version.ts if it exists
try {
  const versionFileContent = readFileSync(targetPath, 'utf8');
  const match = versionFileContent.match(/export const version = '(.*)';/);
  if (match) {
    currentVersion = match[1];
  }
} catch (err) {
  // File does not exist or can't be read, will be created
}

// Update version.ts if the version has changed
if (currentVersion !== packageVersion) {
  const envConfigFile = `export const version = '${packageVersion}';\n`;
  writeFileSync(targetPath, envConfigFile, 'utf8');
  console.log(`Version updated in version.ts: ${packageVersion}`);
} else {
  console.log(`Version in version.ts is already up-to-date: ${currentVersion}`);
}
