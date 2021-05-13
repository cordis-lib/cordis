/* eslint-disable */

const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const files = [];
function read(dir, depth = 0) {
  const paths = readdirSync(dir);
  
  for (const path of paths) {
    const full = join(dir, path);

    if (statSync(full).isDirectory() && depth <= 1) {
      read(full, depth + 1);
    } else {
      files.push(full);
    }
  }
}

read(join(__dirname, 'libs'));
read(join(__dirname, 'services'));

module.exports = {
  bumpFiles: files
    .filter(f => f.endsWith('package.json'))
    .map(filename => ({
      filename,
      type: 'json'
    }))
};
