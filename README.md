### MORE INCOMING

### IMPORTANT! MADE FOR NODE V6^

### Requirements
#### [cookie-parser](https://www.npmjs.com/package/cookie-parser)
```
npm install --save cookie-parser
app.use(cookieParser());
```

### Client Side Helpers

derelict provides helpers for client side use.
getXSRF extracts the xsrf token from browser cookie storage that needs to be attached by hand to any request that needs authentication. 
defaultRoutes is an object with the default routes when using derelict's AuthRouter with express
```
import { getXSRF, defaultRoutes } from 'derelict/lib/clientHelpers';

defaultRoutes = {
  login: '/login',
  logout: '/logout',
  signup: '/signup'
};
```
