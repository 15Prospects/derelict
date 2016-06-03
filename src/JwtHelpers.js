import jwt from 'jwt-simple';

export default class JwtHelpers {
  constructor(secret) {
    this.secret = secret;
    
    this.decodeJWT = this.decodeJWT.bind(this);
  }
  
  generateJWT(user, xsrfSecret = null) {
    const tokenData = {
      user,
      xsrfSecret
    };
    return jwt.encode(tokenData, this.secret);
  }

  decodeJWT(token) {
    return jwt.decode(token, this.secret);
  }
}
