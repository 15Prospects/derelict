import http from 'http';
import { generateXSRF } from './xsrfHelpers';


export default function augmentResponse({ generateJWT }, accessTokenExpiry, sslDomain) {
  /**
   * Create JWT and XSRF tokens with data, attach as cookies to response object
   * @param {Object} data           Data to store in JWT
   * @param {Number} options.maxAge Optional lifetime of token in milliseconds
   * @param {String} options.name   Optional name of jwt token (default 'ACCESS')
   * @return {Object} data object or error
   */
  function secureJWT(data, { maxAge = accessTokenExpiry, name = 'ACCESS' } = {}) {
    return new Promise((resolve, reject) => (
      generateXSRF(({ error, token, secret: xsrfSecret }) => {
        if (error) {
          reject({ error: new Error(`Error generating secure ${name} tokens`), status: 500 });
        }

        const currentDate = Date.now();
        const newJWT = generateJWT({
          ...data,
          xsrfSecret,
          tokenExpiryDate: new Date(currentDate + maxAge),
          tokenIssueDate: new Date(currentDate),
        });
        const jwtCookieOptions = { maxAge, path: '/', httpOnly: true };
        const xsrfCookieOptions = { maxAge, path: '/' };

        if (sslDomain) {
          xsrfCookieOptions.secure = true;
          jwtCookieOptions.secure = true;
          xsrfCookieOptions.domain = sslDomain;
          jwtCookieOptions.domain = sslDomain;
        }

        const tokenName = name.toUpperCase();
        this.cookie(`X-${tokenName}-JWT`, newJWT, jwtCookieOptions);
        this.cookie(`X-${tokenName}-XSRF`, token, xsrfCookieOptions);
        resolve(data);
      })
    ));
  }

  http.OutgoingMessage.prototype.secureJWT = secureJWT;

  function clearSecureJWT(name = 'ACCESS') {
    const options = {
      path: '/',
      ...sslDomain && { domain: sslDomain },
    };
    const tokenName = name.toUpperCase();

    this.clearCookie(`X-${tokenName}-JWT`, options);
    this.clearCookie(`X-${tokenName}-XSRF`, options);
  }

  http.OutgoingMessage.prototype.clearSecureJWT = clearSecureJWT;

  // Deprecated
  http.OutgoingMessage.prototype.attachNewJWT = function attachNewJWT(userData, type) {
    const user = { ...userData };
    delete user.password;

    return this.secureJWT(user); 
  }

  http.OutgoingMessage.prototype.createSSRAuthToken = (userId) => {
    return generateJWT({ userId, tokenExpiryDate: new Date(Date.now() + 300000)})
  }
};
