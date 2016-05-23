import JwtHelpers from './JwtHelpers';
import { generateXSRF } from './xsrfHelpers';
import bcrypt from 'bcrypt-nodejs';
import http from 'http';
import MakeCheckAuth from './MakeCheckAuth';

export default class Authenticator {
  constructor({ secret, authRules = [] }) {
    this.jwtHelpers = new JwtHelpers(secret);
    this.authRules = authRules;
    
    this.patchCheckAuth();
  }

  logIn(user, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, isAuth) => {
        if (isAuth) {
          // Delete user password before storing in JWT
          delete user.password;

          // Generate XSRF and JWT Auth tokens
          const XSRF = generateXSRF();
          const JWT = this.jwtHelpers.generateJWT(user, XSRF.secret);

          resolve({
            JWT,
            XSRF: XSRF.token
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
          newUser.password = encryptedPass;
          return resolve(newUser);
        }
      });
    })    
  }
  
  patchCheckAuth() {
    http.IncomingMessage.prototype.checkAuth = MakeCheckAuth(this.jwtHelpers, this.authRules);
  }
}
