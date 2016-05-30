import { verifyXSRF } from './xsrfHelpers';

export default function MakeCheckAuth({ decodeJWT }, authRules) {
  return function(authRule) {

    let token = {};
    let user = {};

    if (this.cookies.jwt) {
      // Decode token
      token = decodeJWT(this.cookies.jwt);
      user = token.user;
      
      // Delete password and set user
      delete user.password;
      this.user = user;
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
    return rule(user) && verifyXSRF(token.xsrfSecret, this.headers.xsrf);
  }
}
