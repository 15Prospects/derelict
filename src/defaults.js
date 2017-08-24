const longTokenExpiry = 31556952000;
const shortTokenExpiry = 3600000;

export default {
  authenticator: null,
  useRefresh: false,
  longTokenExpiry,
  shortTokenExpiry,
  onAuthFail: (userData, next) => next(),
  onRefreshFail: (token, next) => next(),
  validateRefresh: (token, next) => next({}),
};
