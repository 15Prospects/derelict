# Usage

## Client Side

In order for authentication to work properly, you must send http-only cookies, and attach the X-XSRF-HEADER cookie to the request as a header named xsrf.

The getXSRF helper function will get and return the cookie in an object set to the key of xsrf.

```
import { getXSRF } from 'derelict/lib/clientHelpers';

const headers = getXSRF();
console.log(headers) ===>  { xsrf: 'aToken' }
```

Using the fetch API, sending a request to an authenticated route would look something like this:

```
const fetchOptions = {
    // Send http-only jwt
    credentials: 'same-origin',
    // Send xsrf token as header
    headers: {
        xsrf: getXSRF().xsrf
    }
}

fetch('/restricted', fetchOptions)
    .then(result => {})
    .catch(error => {});
```

