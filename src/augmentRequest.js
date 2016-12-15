import http from 'http';
import { verifyXSRF } from './xsrfHelpers';

export default function augmentRequest({ decodeJWT }, authRules = {}) {
  http.IncomingMessage.prototype.attachUser = function attachUser(tokenType) {
    const tokenName = `${tokenType}-JWT`;
    const headerName = `${tokenType}-XSRF`.toLowerCase();
    if (this.cookies && this.cookies[tokenName]) {
      const { user, xsrfSecret } = decodeJWT(this.cookies[tokenName]);
      this.user = user;
      if (user && this.headers[headerName] && verifyXSRF(xsrfSecret, this.headers[headerName])) {
        return true;
      }
      // xsrf fails
      return false;
    }
    // No user data/cookies, not logged in
    return null;
  };

  http.IncomingMessage.prototype.checkAuth = function checkAuth(authRule) {
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
    return rule(this.user, this);
  };
}
