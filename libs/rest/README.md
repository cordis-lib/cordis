# @cordis/rest

## About
Cordis' REST utilities for the Discord API
___

## Example usage
```js
const { RestManager } = require('@cordis/rest');

const main = async () => {
  const rest = new RestManager('token');

  const someUser = await rest.get('/users/223703707118731264');
  const someOtherGuy = await rest.make({
    path: '/users/198536269586890752',
    method: 'get'
  });

  console.log(someUser, someOtherGuy);
};

main();
```
___
