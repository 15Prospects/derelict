// Encrypt password for storage
export function encryptPass (password) {
  return new Promise(function(resolve, reject) {
    bcrypt.hash(password, null, null, function(err, hash) {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    });
  });
}

// Decrypt and compare password
export function comparePass(password, storedPass) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(password, storedPass, function(err, isAuth) {
      if (isAuth) {
        resolve(isAuth);
      } else {
        reject (err || isAuth);
      }
    })
  })
}