function longTokenExpiry() {
  const yearInMilliseconds = 31556952000;
  return yearInMilliseconds * 10;
}

function shortTokenExpiry() {
  const hourInMilliseconds = 3600000;
  return hourInMilliseconds;
}

function refreshAction(token, userData, next) {
  return next(userData);
}

function authFail(userData, next) {
  return next();
}

export default {
  longTokenExpiry,
  shortTokenExpiry,
  refreshAction,
  authFail
};
