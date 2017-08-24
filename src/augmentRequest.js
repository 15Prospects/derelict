import http from 'http';
import { verifyXSRF } from './xsrfHelpers';

export default function augmentRequest({ decodeJWT }, authRules = {}) {
  /**
   * Decode and check validity of secure jwt's
   * @param {String} name Name of JWT token (without leading X- and trailing -JWT)
   */
  function getSecureJWT(name) {
    const tokenName = `X-${name.toUpperCase()}-JWT`;
    const headerName = `X-${name}-XSRF`.toLowerCase();
    
    if (this.cookies && this.cookies[tokenName]) {
      const { xsrfSecret, ...token } = decodeJWT(this.cookies[tokenName]);
      const header = this.headers[headerName];

      if (xsrfSecret && header && verifyXSRF(xsrfSecret, header)) {
        return token;
      }

      return false;
    }

    return undefined;
  };

  http.IncomingMessage.prototype.getSecureJWT = getSecureJWT;

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
  
  // Deprecated
  http.IncomingMessage.prototype.attachUser = function attachUser(type) {
    const tokenType = type && type === 'refresh' ? 'REFRESH' : 'ACCESS';
    const data = this.getSecureJWT(tokenType);
    
    if (data === null || data === false) {
      return data;
    }

    this.user = data;
    return true;
  };
}
