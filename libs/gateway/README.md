# `@cordis/gateway`  

[![GitHub](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://github.com/cordis-lib/cordis/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@cordis/gateway?color=crimson&logo=npm)](https://www.npmjs.com/package/@cordis/gateway)
[![TypeScript](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml/badge.svg)](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml)

The cordis WS client for Discord's API.

## Installation
- `npm install @cordis/gateway` 
- `pnpm install @cordis/gateway` 
- `yarn add @cordis/gateway`

## Example Usage
```ts
const { Cluster } = require('@cordis/gateway');

const main = async () => {
  const manager = new Cluster('token');

  manager
    .on('ready', () => console.log('Hello world!'))
    .on('dispatch', ({ t, d }) => {
      switch (t) {
        case 'MESSAGE_CREATE': {
          if (d.content === '!ping') console.log('pong!');
          break;
        }

        default: break;
      }
    });

  await manager.connect();
};

main();
```

## Documentation
You can find documentation for the whole project over at https://cordis.js.org

## Contributing
Please see the main [README.md](https://github.com/cordis-lib/cordis) for info on how to contribute to this package or the other `@cordis` packages.

## LICENSE
Licensed under the [Apache 2.0](https://github.com/cordis-lib/cordis/blob/main/LICENSE) license.