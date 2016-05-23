import { verifyXSRF } from './xsrfHelpers';

// Auth middleware generator
export default function Authenticator({ decodeJWT }, authRules) {
  return (authRule) => {
    const token = decodeJWT(this.cookies.jwt);
    const user = token.user;
    const xsrfToken = this.headers.xsrf;

    // Test for XSRF
    if (verifyXSRF(token.xsrfSecret, xsrfToken)) {

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
