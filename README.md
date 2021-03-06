<div align="center">
  <br/>
  <p align="center">
    <img width="190" height="190" src="media/cordis_no_letters_black.png">
</div>

# About
cordis is a fully modular, micro-service based [Node.js](https://nodejs.org/) wrapper around the [Discord API](https://discordapp.com/developers/docs/intro)

It is cut up in multiple packages/libraries:

- [`@cordis/bitfield`](https://github.com/cordis-lib/cordis/tree/main/libs/bitfield), for working with bitfields using BigInts
- [`@cordis/brokers`](https://github.com/cordis-lib/cordis/tree/main/libs/brokers), message brokers for routing patterns, pub/sub systems and RPC!
- [`@cordis/common`](https://github.com/cordis-lib/cordis/tree/main/libs/common), cordis core utilities
- [`@cordis/gateway`](https://github.com/cordis-lib/cordis/tree/main/libs/gateway), containing a very flexible way of connecting to Discord's gateway - with clustering support
- [`@cordis/queue`](https://github.com/cordis-lib/cordis/tree/main/libs/queue), simple, small sequential queue for async operations
- [`@cordis/redis-store`](https://github.com/cordis-lib/cordis/tree/main/libs/redis-store), Redis implementation of `@cordis/store`
- [`@cordis/rest`](https://github.com/cordis-lib/cordis/tree/main/libs/rest), tooling for making HTTP requests to Discord, with rate limiting handling
- [`@cordis/routers`](https://github.com/cordis-lib/cordis/tree/main/libs/routers), make API requests with ease using simple dynamic javascript property accessing
- [`@cordis/snowflake`](https://github.com/cordis-lib/cordis/tree/main/libs/snowflake), simple snowflake structure for destructuring Discord IDs into relevant information
- [`@cordis/store`](https://github.com/cordis-lib/cordis/tree/main/libs/store), Simple map-like interface for holding key-value pairs - ships with an in-memory implementation

But also services that hook into RabbitMQ using the libraries mentioned above:

- [`@cordis/gateway-service`](https://github.com/cordis-lib/cordis/tree/main/services/gateway) - https://hub.docker.com/r/cordislib/gateway


# Come talk to me on Discord!

**Permanent invite link**: https://discord.gg/37ysd5dPYk
