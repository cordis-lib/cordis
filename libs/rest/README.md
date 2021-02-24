<div align = "center">

# @cordis/rest

</div>

## Description
Cordis' REST utilities for the Discord API

Note: Props to https://github.com/spec-tacles/spectacles.js for the Mutex logic.
___

## Example usage
```js
const { RestManager } = require('@cordis/rest');

const main = async () => {
  const rest = new RestManager('token');

  const someUser = await rest.get('/users/223703707118731264');
  const someOtherUser = await rest.make({
    path: '/users/198536269586890752',
    method: 'get'
  });

  console.log(someUser, someOtherUser);
};

main();
```
___

## Documentation
You can find documentation for the whole project over at https://cordis.didinele.me
