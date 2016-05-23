import { verifyXSRF } from './xsrfHelpers';

export default function MakeCheckAuth({ decodeJWT }, authRules) {
  return function(authRule) {
    const token = decodeJWT(this.cookies.jwt);
    const user = token.user;
    const xsrfToken = this.headers.xsrf;
  
    const rule = authRule ? authRules[authRule] : () => true;
  
    // Throw error if authentication rule not pass in config
    if (!rule) {
      throw new Error(`Authentication rule ${authRule} not found.`)
    }
  
    // Test XSRF and Authentication Rule
    if (verifyXSRF(token.xsrfSecret, xsrfToken) && rule(user)) {
      // Authentication passed, return user data
      this.user = user;
      return true;
    } else {
      // XSRF test failed
      return false;
    }
  }
}
