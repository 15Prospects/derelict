import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import augmentRequest from './augmentRequest';
import augmentResponse from './augmentResponse';
import defaults from './defaults';

const derelict = (function() {
  let {
    authenticator,
    useRefresh,
    shortTokenExpiry,
    longTokenExpiry,
    onAuthFail,
    onRefreshFail,
    validateRefresh,
  } = defaults;
  let accessTokenExpiry = longTokenExpiry;
  let refreshTokenExpiry = longTokenExpiry;
  let domainString;

  return {
    setup({
      secret,
      createUser,
      fetchUser,
      updateUser,
      authRules,
      refresh,
      onFail,
      sslDomain
    }) {
      domainString = sslDomain;

      if (refresh) {
        useRefresh = true;
        ({
          accessTokenExpiry = shortTokenExpiry,
          refreshTokenExpiry = longTokenExpiry,
          onRefreshFail = onRefreshFail,
          validateRefresh = validateRefresh
        } = typeof refresh === 'boolean' ? {} : refresh);
      }

      const jwt = JwtHelpers(secret);
      authenticator = Authenticator(jwt, createUser, fetchUser, updateUser);
      onAuthFail = onFail || onAuthFail;
      augmentRequest(jwt, authRules);
      augmentResponse(jwt, accessTokenExpiry, refreshTokenExpiry, sslDomain);
    },

    signUp(req, res, next) {
      authenticator.register(req.body)
        .then(user => {
          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(({ error, status }) => {
          res.status(status).json(error);
        });
    },

    logIn(req, res, next) {
      authenticator.authenticate(req.body)
        .then(user => res.secureJWT({ ...user, password: null }))
        .then((user) => {
          if (useRefresh) {
            return res.secureJWT(user, {
              name: 'refresh',
              maxAge: refreshTokenExpiry, 
            });
          }

          return user
        })
        .then((user) => {
          res.status(200).json(user);
          req.user = user;
          next();
        })
        .catch(({ error, status }) => res.status(status).json(error));
    },

    logOut(req, res, next) {
      const clearOpts = { path: '/' };

      if (domainString) {
        clearOpts.domain = domainString;
      }

      res.clearCookie('X-ACCESS-JWT', clearOpts);
      res.clearCookie('X-ACCESS-XSRF', clearOpts);

      if (useRefresh) {
        res.clearCookie('X-REFRESH-JWT', clearOpts);
        res.clearCookie('X-REFRESH-XSRF', clearOpts);
      }

      res.status(200).json({ message: 'Success' });
      next();
    },

    isAuth(ruleName) {
      return (req, res, next) => {
        const accessToken = req.getSecureJWT('access');

        if (accessToken === false) {
          return onAuthFail(accessToken, () => (
            res.status(401).json({ error: 'Unauthorized Access Token' })
          ));
        } else if (accessToken) {
          req.user = accessToken;

          if (req.checkAuth(ruleName)) {
            return next();
          }

          return res.status(401).json({ error: 'User Not Authorized' });
        }

        if (useRefresh && accessToken === null) {
          const refreshToken = req.getSecureJWT('refresh');

          if (refreshToken === false) {
            return onRefreshFail(refreshToken, () => (
              res.status(401).json({ error: 'Unauthorized Refresh Token' })
            ));
          } else if (refreshToken) {
            // validateRefresh should confirm token data is good
            // and return user data for a new access token
            return validateRefresh(refreshToken, user => (
              res
                .secureJWT(user)
                .then((user) => {
                  req.user = user;

                  if (req.checkAuth(ruleName)) {
                    return next();
                  }

                  return res.status(401).json({ error: 'User Not Authorized' });
                })
                .catch(error => (
                  res.status(500).json({ error: 'Error Refreshing Access Token' })
                ))
            ));
          }
        }

        return res.status(401).json({ error: 'User Not Authenticated' });
      }
    },

    attachUser(req, res, next) {
      const token = req.getSecureJWT('access');
      if (token === false) {
        return onAuthFail(req.user, () => (
          res.status(401).json({ error: 'Unauthorized Access Token' })
        ));
      }

      req.user = token;
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
        .catch(({ error, status }) => res.status(status).json(error));
    },

    resetPassword(userIdObj) {
      return authenticator.resetPassword(userIdObj);
    }
  }
}());

export default derelict;
