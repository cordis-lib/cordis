<div align = "center">

# @cordis/routers

</div>

## Description

Construct API paths using simple JavaScript property accessing and execute requests with method calls.

## Example

```js
const { buildRestRouter } = require('@cordis/router');
const { RestManager } = require('@cordis/rest');

const manager = new RestManager(yourToken);
const router = buildRestRouter(manager);

const user = await router.users[someUserId].get();
console.log(user);
```

## Documentation
You can find documentation for the whole project over at https://cordis.didinele.me
