import Token from 'csrf';

const csrf = new Token();

export function generateXSRF(callback) {
  return csrf.secret((error, secret) => {
    if (error) {
      callback({ error });
    }

    const token = csrf.create(secret);
    callback({
      secret,
      token
    })
  });
}

export function verifyXSRF(secret, token) {
  return csrf.verify(secret, token);
}
