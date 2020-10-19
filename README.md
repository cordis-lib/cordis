<div align="center">
  <br/>
  <p align="center">
    <img width="190" height="190" src="media/cordis_no_letters_black.png">
</div>

# About
cordis is a fully modular, micro-service based [Node.js](https://nodejs.org/) wrapper around the [Discord API](https://discordapp.com/developers/docs/intro)

It is cut up in multiple packages/libraries:

- `@cordis/brokers`, message brokers for routing patterns, pub/sub systems and RPC!
- `@cordis/rest`, containing a REST manager for the Discord API, including a rate limiting system and various utilities
- `@cordis/gateway`, containing a very flexible way of connecting to Discord's gateway
- `@cordis/util`, utilities for interacting with Discord or just generally useful functions/structures

But also services that hook into RabbitMQ using the libraries mentioned above:

- `@cordis/rest-service`
- `@cordis/gateway-service`
