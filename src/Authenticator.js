import { generateXSRF } from './xsrfHelpers';
import { comparePass, hashPass } from './passwordHelpers';

export default function Authenticator({ generateJWT }, createUser, fetchUser, updateUser, useXsrf = true) {
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
                const userObject = Object.assign({}, user);
                // Delete user password before storing in JWT
                delete userObject.password;

                resolve(makeTokens(userObject));
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
                const userObject = Object.assign({}, user);
                delete userObject.password;
                resolve(userObject);
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      })
    },

    changePassword(id, password, newPassword) {
      return new Promise((resolve, reject) => {
        fetchUser({ id })
          .then(user => {
            comparePass(password, user)
              .then(() => {
                // Hash new password
                hashPass(newPassword)
                  .then(hash => {
                    const userObject = {
                      query: {
                        id
                      },
                      fieldsToUpdate: {
                        password: hash
                      }
                    };

                    updateUser(userObject)
                      .then(user => {
                        const result = Object.assign({}, user);
                        delete result.password;
                        resolve(result);
                      })
                      .catch(error => reject(error));
                  })
                  .catch(error => reject(error));
              })
              .catch(error => reject(error || 'Password Incorrect'));
          })
          .catch(error => reject(error));
      });
    }
  }
}
