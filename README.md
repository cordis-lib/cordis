<div align="center">
  <br/>
  <p align="center">
    <img width="190" height="190" src="media/cordis_no_letters_black.png">
</div>

# About
cordis is a fully modular, micro-service based [Node.js](https://nodejs.org/) wrapper around the [Discord API](https://discordapp.com/developers/docs/intro)

It is cut up in multiple packages/libraries:

- `@cordis/bitfield`, for working with bitfields using BigInts
- `@cordis/brokers`, message brokers for routing patterns, pub/sub systems and RPC!
- `@cordis/common`, cordis core utilities
- `@cordis/gateway`, containing a very flexible way of connecting to Discord's gateway - with clustering support
- `@cordis/queue`, simple, small sequential queue for async operations
- `@cordis/redis-store`, Redis implementation of `@cordis/store`
- `@cordis/rest`, tooling for making HTTP requests to Discord, with rate limiting handling
- `@cordis/snowflake`, simple snowflake structure for destructuring Discord IDs into relevant information
- `@cordis/store`, Simple map-like interface for holding key-value pairs - ships with an in-memory implementation

But also services that hook into RabbitMQ using the libraries mentioned above:

- `@cordis/gateway-service`

# Roadmap
- 0.1.0 release - See [the remaining issues](https://github.com/cordis-lib/cordis/issues)
- Front facing website and documentation.
- Discord community
