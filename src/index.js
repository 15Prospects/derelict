import { Router } from 'express';
import Middleware from './Middleware';
import Authenticator from './Authenticator';

/*
  {
    id_field: 'id'
    secret
    authRules
  }
 */

export function MakeAuthenticator(config) {
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

export function AuthMiddleware(config) {
  return new Middleware(config);
}

/*
  Auth Router

  Usage: app.use(AuthRouter(config);
 */


export function AuthRouter(config) {
  const authRouter = Router();
  const authMiddleware = AuthMiddleware(config);
  const customRoutes = config.routes || {};
  
  authRouter.route(customRoutes.login || '/login')
    .post(authMiddleware.handleLogIn);

  authRouter.route(customRoutes.logout || '/logout')
    .post(authMiddleware.handleLogOut);

  authRouter.route(customRoutes.signup || '/signup')
    .post(authMiddleware.handleSignUp);
  
  return authRouter;
}
