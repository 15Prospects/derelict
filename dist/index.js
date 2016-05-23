'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _Middleware = require('./Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

var _Authenticator = require('./Authenticator');

var _Authenticator2 = _interopRequireDefault(_Authenticator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  {
    id_field: 'id'
    secret
    authRules
  }
 */

function MakeAuthenticator(config) {
  return new _Authenticator2.default(config);
}

/*
  {
    id_field: 'id'
    secret
    authRules
    fetchUser: // function provided with jwt_payload and done
    createUser: // function to create user provided with done
  }
 */

function AuthMiddleware(config) {
  return new _Middleware2.default(config);
}

/*
  Auth Router

  Usage: app.use(AuthRouter(config);
 */

function AuthRouter(config) {
  const authRouter = (0, _express.Router)();
  const authMiddleware = AuthMiddleware(config);

  authRouter.route('/login').post(authMiddleware.handleLogIn);

  authRouter.route('/logout').post(authMiddleware.handleLogOut);

  authRouter.route('/signup').post(authMiddleware.handleSignUp);

  return authRouter;
}

module.exports = {
  AuthRouter,
  AuthMiddleware
};