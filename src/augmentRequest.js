import http from 'http';
import { verifyXSRF } from './xsrfHelpers';

function MakeAttachUser(decodeJWT) {
  return function attachUser() {
    if (this.cookies.jwt) {
      // Decode token
      const { user, xsrfSecret = null } = decodeJWT(this.cookies.jwt);

      // Set user & xsrfSecret properties on request object
      this.user = user;
      this.xsrfSecret = xsrfSecret;
    }
  }
}

function MakeCheckXSRF() {
  return function checkXSRF() {
    // If xsrf is enabled, verifyXSRF tokens, otherwise default to true
    return verifyXSRF(this.xsrfSecret, this.headers.xsrf);
  };
}

function MakeCheckAuth(authRules, useXsrf) {
  return function checkAuth(authRule) {
    
    // Attach user to request object
    this.attachUser();
    
    // If using xsrf and checking xsrf fails 
    if (useXsrf && !this.checkXSRF()) {
      return false;
    }

    // If no authentication rule is passed, return true
    if (!authRule) {
      return true;
    }

    const rule = authRules[authRule];
  
    // Throw error if authentication rule not pass in config
    if (!rule) {
      throw new Error(`Authentication rule ${authRule} not found.`);
    }
  
    // Test Authentication Rule && XSRF
    return rule(this.user);
  }
}

export default function augmentRequest({ decodeJWT }, authRules = {}, useXsrf = true) {
  http.IncomingMessage.prototype.attachUser = MakeAttachUser(decodeJWT);
  http.IncomingMessage.prototype.checkXSRF = MakeCheckXSRF();
  http.IncomingMessage.prototype.checkAuth = MakeCheckAuth(authRules, useXsrf);
}
