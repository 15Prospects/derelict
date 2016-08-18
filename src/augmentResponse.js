import http from 'http';
import { generateXSRF } from './xsrfHelpers';

function makeAttachJWT(generateJWT, useXsrf) {
  return function attachNewJWT(userObject) {
    const newTokenData = Object.assign({}, userObject);
    delete newTokenData.password;

    // Generate XSRF
    const { secret = null, token = null } = useXsrf ? generateXSRF() : {};

    this.cookie('jwt', generateJWT(newTokenData, secret), { httpOnly: true, path: '/' });

    if (useXsrf) {
      this.cookie('X-XSRF-HEADER', token, { path: '/' });
    }

    return void 0;
  }
}

export default function augmentResponse({ generateJWT }, useXsrf) {
  http.OutgoingMessage.prototype.attachNewJWT = makeAttachJWT(generateJWT, useXsrf);
};
