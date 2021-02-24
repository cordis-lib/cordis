<div align = "center">

# @cordis/gateway

</div>

## Description
The cordis WS client for Discord's API
___

## Example usage
```js
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
___

## Documentation
You can find documentation for the whole project over at https://cordis.didinele.me
