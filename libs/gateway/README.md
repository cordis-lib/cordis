# @cordis/gateway

## About
The cordis WS client for Discord's API
___

## Example usage
```js
const { WebsocketManager } = require('@cordis/gateway');

const main = async () => {
  const manager = new WebsocketManager('token');

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
___
