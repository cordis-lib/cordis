# `@cordis/rest`  

[![GitHub](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://github.com/cordis-lib/cordis/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@cordis/rest?color=crimson&logo=npm)](https://www.npmjs.com/package/@cordis/rest)
[![TypeScript](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml/badge.svg)](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml)

Cordis' REST utilities for the Discord API

Note: Props to https://github.com/spec-tacles/spectacles.js for the Mutex logic.

## Installation
- `npm install @cordis/rest` 
- `pnpm install @cordis/rest` 
- `yarn add @cordis/rest`

## Example Usage
```ts
const { RestManager } = require('@cordis/rest');

const main = async () => {
  const rest = new RestManager('token');

  const someUser = await rest.get('/users/223703707118731264');
  const someOtherUser = await rest.make({
    path: '/users/198536269586890752',
    method: 'get'
  });

  console.log(someUser, someOtherUser);
};

main();
```

## Documentation
You can find documentation for the whole project over at https://cordis.didinele.me

## Contributing
Please see the main [README.md](https://github.com/cordis-lib/cordis) for info on how to contribute to this package or the other `@cordis` packages.

## LICENSE
Licensed under the [Apache 2.0](https://github.com/cordis-lib/cordis/blob/main/LICENSE) license.