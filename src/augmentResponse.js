import http from 'http';
import { generateXSRF } from './xsrfHelpers';

export default function augmentResponse({ generateJWT }) {
  http.OutgoingMessage.prototype.attachNewJWT = function attachNewJWT(userData, tokenName, getTokenExpiry) {
    // Generate XSRF
    return new Promise((resolve, reject) => {
      generateXSRF(({ error, token, secret: xsrfSecret }) => {
        if (error) {
          reject(error);
        }

        const maxAge = getTokenExpiry()
        const currentDate = Date.now();
        const user = { ...userData };
        delete user.password;

        const newJWT = generateJWT({
          user,
          xsrfSecret,
          tokenExpiryDate: new Date(currentDate + maxAge),
          tokenIssueDate: new Date(currentDate)
        });

        this.cookie(`${tokenName}-JWT`, newJWT, {
          maxAge,
          httpOnly: true,
          path: '/'
        });

        this.cookie(`${tokenName}-XSRF`, token, {
          maxAge,
          path: '/'
        });

        resolve(newJWT);
      });
    })


  }
};
