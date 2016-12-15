import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import augmentRequest from './augmentRequest';
import augmentResponse from './augmentResponse';
import defaults from './defaults';

const derelict = (function() {
  let authenticator = {};
  let onAuthFail = null;
  let useRefresh = false;
  let getAccessTokenExpiry = defaults.longTokenExpiry;
  let getRefreshTokenExpiry = null;
  let onRefreshFail = null;
  let validateRefresh = null;

  return {
    setup({
      secret,
      createUser,
      fetchUser,
      updateUser,
      authRules,
      refresh,
      onFail = defaults.authFail
    }) {
      const jwt = JwtHelpers(secret);
      authenticator = Authenticator(jwt, createUser, fetchUser, updateUser);
      onAuthFail = onFail;
      augmentRequest(jwt, authRules);
      augmentResponse(jwt);
      if (refresh) {
        useRefresh = true;
        const {
          accessTokenExpiry = defaults.shortTokenExpiry,
          refreshTokenExpiry = defaults.longTokenExpiry,
          onFail = defaults.refreshAction,
          validate = defaults.refreshAction
        } = typeof refresh === 'boolean' ? {} : refresh;
        getAccessTokenExpiry = accessTokenExpiry;
        getRefreshTokenExpiry = refreshTokenExpiry;
        onRefreshFail = onFail;
        validateRefresh = validate;
      }
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
          res
            .attachNewJWT(user, 'X-ACCESS', getAccessTokenExpiry)
            .then(accessToken => {
              req.user = user;
              if (useRefresh) {
                // Create refresh token and make available to next middleware
                return res
                  .attachNewJWT(
                    user,
                    'X-REFRESH',
                    getRefreshTokenExpiry
                  )
                  .then(refreshToken => {
                    req.cookies['X-REFRESH-JWT'] = refreshToken;
                    res.status(200).json(user);
                    return next();
                  })
                  .catch(error => res.status(500).json({ error: 'Error Generating Refresh Token' }))
              } else {
                res.status(200).json(user);
                return next();
              }
            })
            .catch(error => res.status(500).json({ error: 'Error Generating Access Token' }));
        })
        .catch(error => {
          res.status(400).json(error);
        });
    },

    logOut(req, res, next) {
      res.clearCookie('X-ACCESS-JWT', { path: '/' });
      res.clearCookie('X-ACCESS-XSRF', { path: '/' });
      if (useRefresh) {
        res.clearCookie('X-REFRESH-JWT', { path: '/' });
        res.clearCookie('X-REFRESH-XSRF', { path: '/' });
      }
      res.status(200).json({ message: 'Success' });
      next();
    },

    isAuth(ruleName) {
      return (req, res, next) => {
        const hasAccess = req.attachUser('X-ACCESS');

        if (hasAccess === false) {
          return onAuthFail(req.user, () => res.status(401).json({ error: 'Unauthorized Access Token' }));
        } else if (hasAccess) {
          if (req.checkAuth(ruleName)) {
            return next();
          }
          return res.status(401).json({ error: 'User Not Authorized' });
        }

        if (useRefresh && hasAccess === null) {
          const hasRefresh = req.attachUser('X-REFRESH');
          const token = req.cookies['X-REFRESH-JWT'];
          if (hasRefresh === false) {
            return onRefreshFail(token, req.user, () => (
              res.status(401).json({ error: 'Unauthorized Refresh Token' })
            ));
          } else if (hasRefresh) {
            return validateRefresh(token, req.user, (user) => (
              res
                .attachNewJWT(user, 'X-ACCESS', getRefreshTokenExpiry)
                .then(() => {
                  req.user = user;
                  if (req.checkAuth(ruleName)) {
                    return next();
                  }
                  return res.status(401).json({ error: 'User Not Authorized' });
                })
                .catch(error => res.status(500).json({ error: 'Error Refreshing Access Token' }))
            ));
          }
        }

        return res.status(401).json({ error: 'User Not Authenticated' });
      }
    },

    attachUser(req, res, next) {
      const hasAccess = req.attachUser();
      if (hasAccess === false) {
        return onAuthFail(req.user, () => res.status(401).json({ error: 'Unauthorized Access Token' }));
      }
      return next();
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
