import { comparePass, hashPass } from './passwordHelpers';
import shortid from 'shortid';

export default function Authenticator({ generateJWT }, createUser, fetchUser, updateUser) {
  return {
    authenticate({ password, ...userIdObj }) {
      return fetchUser(userIdObj)
        .then(user => comparePass(password, user))
        .then(user => {
          const userObject = { ...user };
          // Delete user password before storing in JWT
          delete userObject.password;
          return userObject;
        })
        .catch(error => {
          throw { status: 401, error };
        });
    },

    register(newUser) {
      return hashPass(newUser.password)
        .then(hash => createUser({ ...newUser, password: hash }))
        .then(newUser => {
          const userObject = { ...newUser }
          delete userObject.password;
          return userObject;
        })
        .catch(error => {
          throw { status: 500, error };
        });
    },

    changePassword({ password, newPassword, ...userIdObj }) {
      return fetchUser(userIdObj)
        .then(user => (
          comparePass(password, user)
            .catch(() => {
              throw new Error('Unauthorized')
            })
        ))
        .then(() => hashPass(newPassword))
        .then(hashedPass => updateUser(userIdObj, { password: hashedPass }))
        .then(user => {
          const userObject = { ...user };
          delete userObject.password;
          return userObject;
        })
        .catch(error => {
          const status = error.message === 'Unauthorized' ? 401 : 500;
          throw { status, error };
        });
    },

    resetPassword(userIdObj) {
      const tempPassword = shortid.generate();
      return hashPass(tempPassword)
        .then(password => updateUser(userIdObj, { password }))
        .then(() => tempPassword);
    }
  }
}
