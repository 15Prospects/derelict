import { generateXSRF } from './xsrfHelpers';
import { comparePass, hashPass } from './passwordHelpers';

export default function Authenticator({ generateJWT }, createUser, fetchUser, useXsrf = true) {
  
  function makeTokens(user) {
    // Generate XSRF
    const { secret = null, token = null } = useXsrf ? generateXSRF() : {};

    return {
      user,
      JWT: generateJWT(user, secret),
      XSRF: token
    };
  }
  
  return {
    authenticate(email, password) {
      return new Promise((resolve, reject) => {
        fetchUser({ email })
          .then(user => {
            comparePass(password, user)
              .then(() => {
                // Delete user password before storing in JWT
                delete user.password;

                resolve(makeTokens(user));
              })
              .catch(error => {
                reject(error || 'Password Incorrect');
              });
          })
          .catch(error => {
            reject(error);
          })
      })
    },

    register(newUser) {
      return new Promise((resolve, reject) => {
        hashPass(newUser.password)
          .then(hash => {
            newUser.password = hash;
            createUser(newUser)
              .then(user => {
                delete user.password;
                resolve(user);
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      })
    }
  }
}
