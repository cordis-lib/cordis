<div align="center">
  <br/>
  <p align="center">
    <img width="190" height="190" src="media/cordis_no_letters_black.png">
</div>

# About
cordis is a fully modular, micro-service based [Node.js](https://nodejs.org/) wrapper around the [Discord API](https://discordapp.com/developers/docs/intro)

It is cut up in multiple packages/libraries:

- `@cordis/brokers`, message brokers for routing patterns, pub/sub systems and RPC!
- `@cordis/core`, a library for interfacing with the Cordis services
- `@cordis/rest`, containing a REST manager for the Discord API, including a rate limiting system and various utilities
- `@cordis/gateway`, containing a very flexible way of connecting to Discord's gateway
- `@cordis/util`, utilities for interacting with Discord or just generally useful functions/structures

But also services that hook into RabbitMQ using the libraries mentioned above:

- `@cordis/rest-service`
- `@cordis/gateway-service`

# Roadmap
- Finishing `@cordis/core` is the currect absolute priority. No voice support is initially planned; but really high API coverage is.
- 0.1.0 release
- Unit tests for the entire toolset.
- Front facing website and documentation.
- [Community](https://discord.gg/37ysd5dPYk)
