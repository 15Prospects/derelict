import { generateXSRF } from './xsrfHelpers';
import { comparePass, hashPass } from './passwordHelpers';
import shortid from 'shortid';

export default function Authenticator({ generateJWT }, createUser, fetchUser, updateUser, useXsrf) {
  return {
    authenticate({ password, ...userIdObj }) {
      return new Promise((resolve, reject) => {
        fetchUser(userIdObj)
          .then(user => {
            comparePass(password, user)
              .then(() => {
                const userObject = { ...user }
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
                const userObject = { ...user }
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

    changePassword({ password, newPassword, ...userIdObj }) {
      return new Promise((resolve, reject) => {
        fetchUser(userIdObj)
          .then(user => {
            comparePass(password, user)
              .then(() => {
                // Hash new password
                hashPass(newPassword)
                  .then(hashedPass => {
                    updateUser(userIdObj, { password: hashedPass })
                      .then(user => {
                        const result = { ...user }
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
    },

    resetPassword(userIdObj) {
      return new Promise((resolve, reject) => {
        fetchUser(userIdObj)
          .then(user => {
            const tempPassword = shortid.generate();
            hashPass(tempPassword)
              .then(password => {
                updateUser(userIdObj, { password })
                  .then(() => {
                    resolve(password);
                  })
                  .catch(error => reject(error))
              })
              .catch(error => reject(error))
          })
          .catch(error => reject(error))
      })
    }
  }
}
