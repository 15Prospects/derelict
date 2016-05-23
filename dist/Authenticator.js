'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Authenticator;

var _xsrfHelpers = require('./xsrfHelpers');

// Auth middleware generator
function Authenticator({ decodeJWT }, authRules) {
  return authRule => {
    const token = decodeJWT(this.cookies.jwt);
    const user = token.user;
    const xsrfToken = this.headers.xsrf;

    // Test for XSRF
    if ((0, _xsrfHelpers.verifyXSRF)(token.xsrfSecret, xsrfToken)) {

      // Test authentication
      if (authRules[authRule](token)) {
        // Authentication passed, set request.user and return true
        this.user = user;
        return true;
      } else {
        // User unauthorized
        return false;
      }
    } else {
      // XSRF test failed
      return false;
    }
  };
}