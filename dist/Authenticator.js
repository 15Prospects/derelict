'use strict';

var _JwtHelpers = require('./JwtHelpers');

var _JwtHelpers2 = _interopRequireDefault(_JwtHelpers);

var _xsrfHelpers = require('./xsrfHelpers');

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _MakeCheckAuth = require('MakeCheckAuth');

var _MakeCheckAuth2 = _interopRequireDefault(_MakeCheckAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Authenticator {
  constructor({ secret, authRules = [] }) {
    this.jwtHelpers = new _JwtHelpers2.default(secret);
    this.authRules = authRules;

    this.patchCheckAuth();
  }

  logIn(user, password) {
    return new Promise((resolve, reject) => {
      _bcryptNodejs2.default.compare(password, user.password, (error, isAuth) => {
        if (isAuth) {
          // Delete user password before storing in JWT
          delete user.password;

          // Generate XSRF and JWT Auth tokens
          const XSRF = (0, _xsrfHelpers.generateXSRF)();
          const JWT = this.jwtHelpers.generateJWT(user, XSRF.secret);

          resolve({
            JWT,
            XSRF: XSRF.token
          });
        } else {
          reject(error || 'Password Incorrect');
        }
      });
    });
  }

  encryptPass(newUser) {
    return new Promise((resolve, reject) => {
      _bcryptNodejs2.default.hash(newUser.password, null, null, (error, hash) => {
        if (error) {
          return reject(error);
        } else {
          newUser.password = encryptedPass;
          return resolve(newUser);
        }
      });
    });
  }

  patchCheckAuth() {
    _http2.default.IncomingMessage.prototype.checkAuth = (0, _MakeCheckAuth2.default)(this.jwtHelpers, this.authRules);
  }
}

//
// // Auth middleware generator
// export default function AuthChecker({ decodeJWT }, authRules) {
//   return (authRule) => {
//     const token = decodeJWT(this.cookies.jwt);
//     const user = token.user;
//     const xsrfToken = this.headers.xsrf;
//
//     // Test for XS// }RF
//     if (verifyXSRF(token.xsrfSecret, xsrfToken)) {
//
//       // Test authentication
//       if (authRules[authRule](token)) {
//         // Authentication passed, set request.user and return true
//         this.user = user;
//         return true;
//       } else {
//         // User unauthorized
//         return false;
//       }
//     } else {
//       // XSRF test failed
//       return false;
//     }   
//   };