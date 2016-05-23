'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateXSRF = generateXSRF;
exports.verifyXSRF = verifyXSRF;

var _csrf = require('csrf');

var _csrf2 = _interopRequireDefault(_csrf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const csrf = new _csrf2.default();

function generateXSRF() {
  const secret = csrf.secretSync();

  const token = csrf.create(secret);

  return {
    secret,
    token
  };
}

function verifyXSRF(secret, token) {
  return csrf.verify(secret, token);
}