import JwtHelpers from './JwtHelpers';
import { generateXSRF } from './xsrfHelpers';
import bcrypt from 'bcrypt-nodejs';
import http from 'http';
import { MakeAttachUser, MakeCheckXSRF, MakeCheckAuth } from './augmentRequest';

export default class Authenticator {
  constructor({ secret, useXsrf = true, authRules = [] }) {
    this.jwtHelpers = new JwtHelpers(secret);
    this.useXsrf = useXsrf;
    this.authRules = authRules;

    this.augmentRequest();
  }

  logIn(user, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, isAuth) => {
        if (isAuth) {
          // Delete user password before storing in JWT
          delete user.password;

          // Generate XSRF and JWT Auth tokens
          const { secret = null, token = null } = this.useXsrf ? generateXSRF() : {};
          const JWT = this.jwtHelpers.generateJWT(user, secret);

          resolve({
            JWT,
            XSRF: token
          });
        } else {
          reject(error || 'Password Incorrect');
        }
      });
    })
  }
  
  encryptPass(newUser) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(newUser.password, null, null, (error, hash) => {
        if (error) {
          return reject(error);
        } else {
          newUser.password = hash;
          return resolve(newUser);
        }
      });
    })    
  }
  
  augmentRequest() {
    http.IncomingMessage.prototype.attachUser = MakeAttachUser(this.jwtHelpers);
    http.IncomingMessage.prototype.checkXSRF = MakeCheckXSRF();
    http.IncomingMessage.prototype.checkAuth = MakeCheckAuth(this.authRules, this.useXsrf);
  }
}
