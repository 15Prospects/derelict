// Default middleware routes when using AuthRouter
const defaultRoutes = {
  login: '/login',
  logout: '/logout',
  signup: '/signup'
};

// Function to get cookie from browser by name
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

// Extract XSRF token from cookie storage on client browser
function getXSRF() {
  var headers = {};
  var xsrf = getCookie('X-XSRF-HEADER');

  if (xsrf) {
    headers.xsrf = xsrf;
  }

  return headers;
}

export default {
  defaultRoutes,
  getCookie,
  getXSRF
}
