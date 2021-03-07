# `@cordis/routers`  

[![GitHub](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://github.com/cordis-lib/cordis/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@cordis/routers?color=crimson&logo=npm)](https://www.npmjs.com/package/@cordis/routers)
[![TypeScript](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml/badge.svg)](https://github.com/cordis-lib/cordis/actions/workflows/quality.yml)

Construct API paths using simple JavaScript property accessing and execute requests with method calls.

## Installation
- `npm install @cordis/routers` 
- `pnpm install @cordis/routers` 
- `yarn add @cordis/routers`

## Example Usage
```ts
const { buildRestRouter } = require('@cordis/router');
const { RestManager } = require('@cordis/rest');

const manager = new RestManager(yourToken);
const router = buildRestRouter(manager);

const user = await router.users[someUserId].get();
console.log(user);
```

## Documentation
You can find documentation for the whole project over at https://cordis.didinele.me

## Contributing
Please see the main [README.md](https://github.com/cordis-lib/cordis) for info on how to contribute to this package or the other `@cordis` packages.

## LICENSE
Licensed under the [Apache 2.0](https://github.com/cordis-lib/cordis/blob/main/LICENSE) license.