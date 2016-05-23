import Token from 'csrf';

const csrf = new Token();

export function generateXSRF() {
  const secret = csrf.secretSync();

  const token = csrf.create(secret);
  
  return {
    secret,
    token
  }
}

export function verifyXSRF(secret, token) {
  return csrf.verify(secret, token);
}
