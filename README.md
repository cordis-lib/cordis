<div align="center">
  <img width="300" height="300" style="width: 100%; height: auto;" src="media/cordis_transparent.png">
  <h4>
    A fully modular, micro-service based <a href="https://nodejs.org/">Node.js</a> wrapper around the <a href="https://discordapp.com/developers/docs/intro">Discord API</a>
  </h3>

  <p align="center">
    <br />
    <h3>
      <strong>
        <a href="https://cordis.js.org/">Explore the docs »</a><a href="https://discord.gg/37ysd5dPYk"> Join Our Discord!</a>
      </strong>
    </h2>
  </p>  

  <p>
      <img src="https://github.com/cordis-lib/cordis/actions/workflows/quality.yml/badge.svg" alt="Quality Check">
      <img src="https://github.com/cordis-lib/cordis/actions/workflows/docs.yml/badge.svg" alt="Deploy Docs"><br>
      <a href="https://github.com/cordis-lib/cordis/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-yellow.svg" alt="License: APACHE 2.0"></a>
      <a href="https://github.com/cordis-lib/cordis/issues"><img src="https://img.shields.io/github/issues-raw/cordis-lib/cordis.svg?maxAge=25000" alt="Issues"></a>
      <a href="https://github.com/cordis-lib/cordis/pulls"><img src="https://img.shields.io/github/issues-pr/cordis-lib/cordis.svg?style=flat" alt="GitHub pull requests"></a><br>
  </p>
</div>

# Packages

Cordis is cut up in the form of multiple packages/libraries:

- [`@cordis/bitfield`](https://github.com/cordis-lib/cordis/tree/main/libs/bitfield) - A simple structure for working with bitfields using BigInts
- [`@cordis/brokers`](https://github.com/cordis-lib/cordis/tree/main/libs/brokers) - Message brokers for routing patterns, pub/sub systems and RPC!
- [`@cordis/common`](https://github.com/cordis-lib/cordis/tree/main/libs/common) - Common structures and utility shared across packages.
- [`@cordis/gateway`](https://github.com/cordis-lib/cordis/tree/main/libs/gateway) - A very flexible way of connecting to Discord's gateway, with clustering support.
  - [`@cordis/gateway-service`](https://github.com/cordis-lib/cordis/tree/main/services/gateway) ([Docker](https://hub.docker.com/r/cordislib/gateway)) - Service that hooks into RabbitMQ using `@cordis/gateway`
- [`@cordis/queue`](https://github.com/cordis-lib/cordis/tree/main/libs/queue) - A simple and compact sequential queue for async operations
- [`@cordis/redis-store`](https://github.com/cordis-lib/cordis/tree/main/libs/redis-store) - A Redis implementation of `@cordis/store`
- [`@cordis/rest`](https://github.com/cordis-lib/cordis/tree/main/libs/rest) - Tooling for making HTTP requests to Discord, with rate limiting handling
- [`@cordis/routers`](https://github.com/cordis-lib/cordis/tree/main/libs/routers) - Make API requests with ease using simple dynamic JavaScript property accessing
- [`@cordis/store`](https://github.com/cordis-lib/cordis/tree/main/libs/store) - A simple map-like interface for holding key-value pairs - ships with an in-memory implementation

# Contributing
We make use of [`PNPM`](https://pnpm.js.org/) to manage our monorepo setup. It is expected that you have an up-to-date version of it. 

Please ensure you run `pnpm run lint`, `pnpm run build`, and `pnpm run test` in the root before pushing your commits.

Please ensure that you follow our [Code Of Conduct](https://github.com/discordjs/discord.js/blob/master/.github/CODE_OF_CONDUCT.md).

If all checks out, [Submit a Pull Request](https://github.com/cordis-lib/cordis/compare)

# LICENSING

© 2020, [didinele](https://github.com/didinele). Some rights reserved.

> Cordis is licensed under [Apache 2.0](https://github.com/cordis-lib/cordis/blob/main/LICENSE)
