import http from 'http';
import { generateXSRF } from './xsrfHelpers';

export default function augmentResponse({ generateJWT }, accessTokenExpiry, refreshTokenExpiry, sslDomain) {
  http.OutgoingMessage.prototype.attachNewJWT = function attachNewJWT(userData, type) {
    // Generate XSRF
    return new Promise((resolve, reject) => {
      let tokenName = 'X-ACCESS';
      let maxAge = accessTokenExpiry;

      if (type === 'refresh') {
        tokenName = 'X-REFRESH';
        maxAge = refreshTokenExpiry;
      }

      generateXSRF(({ error, token, secret: xsrfSecret }) => {
        if (error) {
          reject(error);
        }

        const currentDate = Date.now();
        const user = { ...userData };
        delete user.password;

        const newJWT = generateJWT({
          user,
          xsrfSecret,
          tokenExpiryDate: new Date(currentDate + maxAge),
          tokenIssueDate: new Date(currentDate)
        });

        const jwtCookieOptions = { maxAge, path: '/', httpOnly: true };
        const xsrfCookieOptions = { maxAge, path: '/' };

        if (sslDomain) {
          xsrfCookieOptions.secure = true;
          jwtCookieOptions.secure = true;
          xsrfCookieOptions.domain = sslDomain;
          jwtCookieOptions.domain = sslDomain;
        }

        this.cookie(`${tokenName}-JWT`, newJWT, jwtCookieOptions);
        this.cookie(`${tokenName}-XSRF`, token, xsrfCookieOptions);

        resolve(newJWT);
      });
    })


  }
};
