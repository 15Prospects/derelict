import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import augmentRequest from './augmentRequest';

const derelict = (function(){
  let useXsrf = true;
  let authenticator = {};

  return {
    setup({ secret, xsrf = true, createUser, fetchUser, authRules }) {
      const jwt = JwtHelpers(secret);
      useXsrf = xsrf;
      authenticator = Authenticator(jwt, createUser, fetchUser, useXsrf);
      augmentRequest(jwt, authRules, useXsrf);
    },

    signUp(req, res) {
      const newUser = req.body;

      authenticator.register(newUser)
        .then(user => {
          res.status(200).json(user);
        })
        .catch(error => {
          res.status(500).json(error);
        })
    },

    logIn(req, res) {
      const { email, password } = req.body;

      authenticator.authenticate(email, password)
        .then(({JWT, XSRF, user}) => {
          res.cookie('jwt', JWT, { httpOnly: true, path: '/' });

          if (useXsrf) {
            res.cookie('X-XSRF-HEADER', XSRF, { path: '/' });
          }

          res.status(200).json(user);
        })
        .catch(error => {
          res.status(400).json(error);
        });
    },

    logOut(req, res) {
      res.clearCookie('jwt', { path: '/' });
      if (useXsrf) {
        res.clearCookie('X-XSRF-HEADER', { path: '/' }); 
      }
      res.status(200).end();
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
    }
  }
}());

export default derelict;
