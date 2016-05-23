'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encryptPass = encryptPass;
exports.comparePass = comparePass;

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Encrypt password for storage
function encryptPass(password) {
  return new Promise(function (resolve, reject) {
    _bcryptNodejs2.default.hash(password, null, null, function (err, hash) {
      if (err) {
        return reject('error encrypting pass');
      }
      return resolve(hash);
    });
  });
}

// Decrypt and compare password
function comparePass(password, storedPass) {
  return new Promise(function (resolve, reject) {
    _bcryptNodejs2.default.compare(password, storedPass, function (err, isAuth) {
      if (isAuth) {
        resolve(isAuth);
      } else {
        reject(err || isAuth);
      }
    });
  });
}