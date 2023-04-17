# Deprecation

cordis has been deprecated. I ([DD](https://github.com/didinele)) joined the [discord.js](https://github.com/discordjs)
team in 2022 Summer when I noticed the project was finally taking a direction I liked. Thanks to the hard work of many people
and to my experience from building cordis, d.js is an amazing place now building micro-serviced bots thanks to `@discordjs/ws` and `@discordjs/core`.

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
- [`@cordis/store`](https://github.com/cordis-lib/cordis/tree/main/libs/store) - A simple map-like interface for holding key-value pairs - ships with an in-memory implementation
- [`@cordis/util`](https://github.com/cordis-lib/cordis/tree/main/libs/util) - Helper methods and structures


# Contributing
We make use of [`PNPM`](https://pnpm.js.org/) to manage our monorepo setup. It is expected that you have an up-to-date version of it. 

Please ensure you run `pnpm run lint`, `pnpm run build`, and `pnpm run test` in the root before pushing your commits.

Please ensure that you follow our [Code Of Conduct](https://github.com/cordis-lib/cordis/blob/main/.github/CODE_OF_CONDUCT.md).

If all checks out, [Submit a Pull Request](https://github.com/cordis-lib/cordis/compare)

# LICENSING

© 2020, [didinele](https://github.com/didinele). Some rights reserved.

> Cordis is licensed under [Apache 2.0](https://github.com/cordis-lib/cordis/blob/main/LICENSE)
