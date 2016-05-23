'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthMiddleware = AuthMiddleware;
exports.AuthRouter = AuthRouter;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _Middleware = require('./Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 {
   id_field: 'id'
   secret
   fetchUser: // function provided with jwt_payload and done
   createUser: // function to create user provided with done
 }
 */

function AuthMiddleware(config) {
  const authMiddleware = new _Middleware2.default(config);

  // Monkey-Patch checkAuth function on request object
  _http2.default.IncomingMessage.prototype.checkAuth = authMiddleware.checkAuth;

  return authMiddleware;
}

/*
  Auth Router

  Usage:

    app.use(middleware(config);


    should expose req.checkAuth(strategy);
 */

function AuthRouter(config) {
  const authRouter = (0, _express.Router)();
  const authMiddleware = AuthMiddleware(config);

  authRouter.route('/login').post(authMiddleware.handleLogIn);

  authRouter.route('/logout').post(authMiddleware.handleLogOut);

  authRouter.route('/signup').post(authMiddleware.handleSignUp);

  return authRouter;
}