import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import augmentRequest from './augmentRequest';
import augmentResponse from './augmentResponse';

const derelict = (function() {
  let useXsrf = true;
  let authenticator = {};

  return {
    setup({ secret, createUser, fetchUser, updateUser, authRules, xsrf = true }) {
      const jwt = JwtHelpers(secret);
      useXsrf = xsrf;
      authenticator = Authenticator(jwt, createUser, fetchUser, updateUser, useXsrf);
      augmentRequest(jwt, authRules, useXsrf);
      augmentResponse(jwt, useXsrf);
    },

    signUp(req, res, next) {
      authenticator.register(req.body)
        .then(user => {
          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(error => {
          res.status(500).json(error);
        });
    },

    logIn(req, res, next) {
      authenticator.authenticate(req.body)
        .then(user => {
          res.attachNewJWT(user);

          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(error => {
          res.status(400).json(error);
        });
    },

    logOut(req, res, next) {
      res.clearCookie('jwt', { path: '/' });
      if (useXsrf) {
        res.clearCookie('X-XSRF-HEADER', { path: '/' });
      }
      res.status(200).json({ message: 'Success' });
      next();
    },

    isAuth(ruleName) {
      return (req, res, next) => {
        if (req.checkAuth(ruleName)) {
          return next();
        }
        return res.status(401).json({ error: 'Unauthorized' })
      }
    },

    attachUser(req, res, next) {
      req.attachUser();
      next();
    },

    // Expects { password, newPassword, +identifiers for fetch function }
    changePassword(req, res, next) {
      authenticator.changePassword(req.body)
        .then(user => {
          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(error => res.status(401).json(error));
    },

    resetPassword(userIdObj) {
      return new Promise((resolve, reject) => {
        authenticator.resetPassword(userIdObj)
          .then(password => resolve(password))
          .catch(error => reject(error));
      });
    }
  }
}());

export default derelict;
