import jwt from 'jwt-simple';

export default function JwtHelpers(secret) {
  return {
    generateJWT(user, xsrfSecret = null) {
      const tokenData = {
        user,
        xsrfSecret
      };
      return jwt.encode(tokenData, secret);
    },
    
    decodeJWT(token) {
      return jwt.decode(token, secret);
    }
  }
}
