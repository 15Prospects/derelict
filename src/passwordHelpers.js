import bcrypt from 'bcrypt-nodejs';

export function comparePass(password, user) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (error, isAuth) => (
      isAuth ? resolve(user) : reject(error)
    ));
  });
}

export function hashPass(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, null, null, (error, hash) => (
      hash ? resolve(hash) : reject(error)
    ));
  });
}
