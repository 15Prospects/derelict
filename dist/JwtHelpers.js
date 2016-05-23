'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JwtHelpers {
  constructor(secret) {
    this.secret = secret;
  }

  generateJWT(user, xsrfSecret) {
    const tokenData = {
      user,
      xsrfSecret
    };
    return _jwtSimple2.default.encode(tokenData, this.secret);
  }

  decodeJWT(token) {
    return _jwtSimple2.default.decode(token, this.secret);
  }
}
exports.default = JwtHelpers;