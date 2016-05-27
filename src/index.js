import http from 'http';
import { Router } from 'express';
import Middleware from './Middleware';
import Authenticator from './Authenticator';
import clientHelpers from './clientHelpers';

/*
  {
    id_field: 'id'
    secret
    authRules
  }
 */

function MakeAuthenticator(config) {
  return new Authenticator(config);
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
  return new Middleware(config);
}

/*
  Auth Router

  Usage: app.use(AuthRouter(config);
 */


function AuthRouter(config) {
  const authRouter = Router();
  const authMiddleware = AuthMiddleware(config);
  
  authRouter.route('/login')
    .post(authMiddleware.handleLogIn);

  authRouter.route('/logout')
    .post(authMiddleware.handleLogOut);

  authRouter.route('/signup')
    .post(authMiddleware.handleSignUp);
  
  return authRouter;
}

module.exports = {
  AuthRouter,
  AuthMiddleware,
  clientHelpers
};
