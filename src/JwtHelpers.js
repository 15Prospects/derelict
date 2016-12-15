import jwt from 'jwt-simple';

export default function JwtHelpers(secret) {
  return {
    generateJWT(tokenData) {
      return jwt.encode(tokenData, secret);
    },

    decodeJWT(token) {
      return jwt.decode(token, secret);
    }
  }
}
