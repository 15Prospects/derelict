import { verifyXSRF } from './xsrfHelpers';

export function MakeAttachUser({ decodeJWT }) {
  return function attachUser() {
    if (this.cookies.jwt) {
      // Decode token
      const token = decodeJWT(this.cookies.jwt);

      // Set user & xsrfSecret properties on request object
      this.user = token.user;
      this.xsrfSecret = token.xsrfSecret;
    }
  }
}

export function MakeCheckXSRF() {
  return function checkXSRF() {
    // If xsrf is enabled, verifyXSRF tokens, otherwise default to true
    return verifyXSRF(this.xsrfSecret, this.headers.xsrf);
  };
}

export function MakeCheckAuth(authRules, useXsrf) {
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
      throw new Error(`Authentication rule ${authRule} not found.`)
    }
  
    // Test Authentication Rule && XSRF
    return rule(this.user);
  }
}
