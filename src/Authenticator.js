import { generateXSRF } from './xsrfHelpers';
import { comparePass, hashPass } from './passwordHelpers';

export default function Authenticator({ generateJWT }, createUser, fetchUser, updateUser, useXsrf) {
  return {
    authenticate({ password, ...userId }) {
      return new Promise((resolve, reject) => {
        fetchUser(userId)
          .then(user => {
            comparePass(password, user)
              .then(() => {
                const userObject = {...user}
                // Delete user password before storing in JWT
                delete userObject.password;

                resolve(userObject);
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
                const userObject = {...user}
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

    changePassword({ password, newPassword, ...userId }) {
      return new Promise((resolve, reject) => {
        fetchUser(userId)
          .then(user => {
            comparePass(password, user)
              .then(() => {
                // Hash new password
                hashPass(newPassword)
                  .then(hashedPass => {
                    updateUser(userId, { password: hashedPass })
                      .then(user => {
                        const result = {...user}
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
