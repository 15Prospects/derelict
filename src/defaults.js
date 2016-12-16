const longTokenExpiry = 31556952000;
const shortTokenExpiry = 3600000;

export default {
  authenticator: null,
  useRefresh: false,
  longTokenExpiry,
  shortTokenExpiry,
  onAuthFail: (userData, next) => next(),
  onRefreshFail: (token, userData, next) => next(),
  validateRefresh: (token, userData, next) => next()
};
