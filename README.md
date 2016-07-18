# Derelict
Derelict is an Express package that is painless to setup, and provides stateless JWT authentication and XSRF protection out of the box.

## Requirements

1. [Node V.6^](https://nodejs.org)
1. [Express](expressjs.com)
1. [Cookie Parser](https://github.com/expressjs/cookie-parser) (or something similar)

For derelict to work, you will need to use cookie-parser on your express server to handle cookies. 

Derelict makes uses cookies to send and store the JWT and XSRF tokens.


```
npm install --save cookie-parser

app.use(cookieParser());
```


## Usage

### Documentation
- [Setup Derelict](./docs/derelict_setup.md)
- [Setup Express Routes](./docs/express_routes.md)
- [Sending Requests](./docs/client_usage.md)
