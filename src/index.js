import http from 'http';
import { Router } from 'express';
import Middleware from './Middleware';

/*
 {
   id_field: 'id'
   secret
   fetchUser: // function provided with jwt_payload and done
   createUser: // function to create user provided with done
 }
 */

function AuthMiddleware(config) {
  const authMiddleware = new Middleware(config);
  
  // Monkey-Patch checkAuth function on request object
  http.IncomingMessage.prototype.checkAuth = authMiddleware.checkAuth;
  
  return authMiddleware;
}

/*
  Auth Router

  Usage:

    app.use(middleware(config);


    should expose req.checkAuth(strategy);
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
  AuthMiddleware
};
