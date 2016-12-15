# Derelict
Derelict is an Express package that is painless to setup, and provides stateless JWT authentication and XSRF protection out of the box.

## Updating 1.1 -> 2
Breaking Changes and new features, more detailed readme coming soon.

## Updating 1.9 -> 1.10

1.10 changes the requirements for updateUser.

updateUser should now accept an object of query parameters, and an object of properties to update.

e.g:
```
updateUser({ email: 'some@email.com' }, { password: 'someNewPassword' });
```

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
