import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import augmentRequest from './augmentRequest';
import augmentResponse from './augmentResponse';

const derelict = (function() {
  let useXsrf = true;
  let authenticator = {};

  return {
    setup({ secret, xsrf = true, createUser, fetchUser, updateUser, authRules, next = [] }) {
      const jwt = JwtHelpers(secret);
      useXsrf = xsrf;
      authenticator = Authenticator(jwt, createUser, fetchUser, updateUser, useXsrf);
      augmentRequest(jwt, authRules, useXsrf);
      augmentResponse(jwt, useXsrf);
    },

    signUp(req, res, next) {
      const newUser = req.body;

      authenticator.register(newUser)
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
      const { email, password } = req.body;

      authenticator.authenticate(email, password)
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

    changePassword(req, res, next) {
      const { id, password, new_password } = req.body;
      authenticator.changePassword(id, password, new_password)
        .then(user => {
          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(error => res.status(401).json(error));
    },

    resetPassword() {
      return new Promise((resolve, reject) => {
        const { email } = req.body;
        authenticator.resetPassword(email)
          .then(password => {
            resolve({ email, password })
          })
          .catch(error => reject(error));
      });
    }
  }
}());

export default derelict;
