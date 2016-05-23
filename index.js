module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.AuthMiddleware = AuthMiddleware;
	exports.AuthRouter = AuthRouter;

	var _http = __webpack_require__(2);

	var _http2 = _interopRequireDefault(_http);

	var _express = __webpack_require__(3);

	var _Middleware = __webpack_require__(4);

	var _Middleware2 = _interopRequireDefault(_Middleware);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 {
	   id_field: 'id'
	   secret
	   fetchUser: // function provided with jwt_payload and done
	   createUser: // function to create user provided with done
	 }
	 */

	function AuthMiddleware(config) {
	  const authMiddleware = new _Middleware2.default(config);

	  // Monkey-Patch checkAuth function on request object
	  _http2.default.IncomingMessage.prototype.checkAuth = authMiddleware.checkAuth;

	  return authMiddleware;
	}

	/*
	  Auth Router

	  Usage:

	    app.use(middleware(config);


	    should expose req.checkAuth(strategy);
	 */

	function AuthRouter(config) {
	  const authRouter = (0, _express.Router)();
	  const authMiddleware = AuthMiddleware(config);

	  authRouter.route('/login').post(authMiddleware.handleLogIn);

	  authRouter.route('/logout').post(authMiddleware.handleLogOut);

	  authRouter.route('/signup').post(authMiddleware.handleSignUp);

	  return authRouter;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _JwtHelpers = __webpack_require__(5);

	var _JwtHelpers2 = _interopRequireDefault(_JwtHelpers);

	var _Authenticator = __webpack_require__(7);

	var _Authenticator2 = _interopRequireDefault(_Authenticator);

	var _passwordHelpers = __webpack_require__(10);

	var _xsrfHelpers = __webpack_require__(8);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	  Authentication Middleware Constructor
	  Expects config ={
	    secret - JWT secret
	    fetchUser - function to fetch a user from database
	    createUser - function to create a new user 
	    authRules - Object with named functions that return boolean based on user object
	  }
	 */
	class Middleware {
	  constructor(config) {
	    if (config.idField) {}
	    // handle unique idField


	    // Setup middleware
	    this.fetchUser = config.fetchUser;
	    this.createUser = config.createUser;
	    this.jwtHelpers = new _JwtHelpers2.default(config.secret);
	    this.authRules = config.authRules;

	    // Initialize checkAuth
	    this.checkAuth = (0, _Authenticator2.default)(this.jwtHelpers, config.authRules);
	  }

	  handleLogIn(request, response) {
	    const { email, password } = request.body;

	    function done(error, user) {
	      if (error) {
	        response.status(400).json(error);
	      } else {
	        // check password
	        (0, _passwordHelpers.comparePass)(password, user.password).then(() => {
	          // Delete user password before storing in JWT
	          delete user.password;

	          // Generate XSRF and JWT Auth tokens
	          const XSRF = (0, _xsrfHelpers.generateXSRF)();
	          const JWT = this.jwtHelpers.generateJWT(user, XSRF.secret);

	          // Set Cookies on response
	          response.cookie('X-XSRF-HEADER', XSRF.token, { path: '/' });
	          response.cookie('jwt', JWT, { path: '/' });

	          // Respond with user
	          response.status(200).json(user);
	        }).catch(error => {
	          response.status(400).json(error);
	        });
	      }
	    }

	    this.fetchUser(email, done);
	  }

	  handleLogOut(request, response) {
	    // Clear cookies on response
	    response.clearCookie('jwt', { path: '/' });
	    response.clearCookie('X-XSRF-Header', { path: '/' });
	    response.status(200).end();
	  }

	  handleSignUp(request, response) {
	    const newUser = request.body;

	    (0, _passwordHelpers.encryptPass)(newUser.password).then(encryptedPass => {
	      newUser.password = encryptedPass;
	      this.createUser(newUser, (error, user) => {
	        if (error) {
	          response.status(400).json({ error });
	        } else {
	          delete user.password;

	          // Respond with user object
	          response.status(200).json(user);
	        }
	      });
	    }).catch(error => {
	      // Error while encrypting password
	      response.status(500).json({ error });
	    });
	  }

	}
	exports.default = Middleware;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jwtSimple = __webpack_require__(6);

	var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class JwtHelpers {
	  constructor(secret) {
	    this.secret = secret;
	  }

	  generateJWT(user, xsrfSecret) {
	    const tokenData = {
	      user,
	      xsrfSecret
	    };
	    return _jwtSimple2.default.encode(tokenData, this.secret);
	  }

	  decodeJWT(token) {
	    return _jwtSimple2.default.decode(token, this.secret);
	  }
	}
	exports.default = JwtHelpers;

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("jwt-simple");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = Authenticator;

	var _xsrfHelpers = __webpack_require__(8);

	// Auth middleware generator
	function Authenticator({ decodeJWT }, authRules) {
	  return authRule => {
	    const token = decodeJWT(this.cookies.jwt);
	    const user = token.user;
	    const xsrfToken = this.headers.xsrf;

	    // Test for XSRF
	    if ((0, _xsrfHelpers.verifyXSRF)(token.xsrfSecret, xsrfToken)) {

	      // Test authentication
	      if (authRules[authRule](token)) {
	        // Authentication passed, set request.user and return true
	        this.user = user;
	        return true;
	      } else {
	        // User unauthorized
	        return false;
	      }
	    } else {
	      // XSRF test failed
	      return false;
	    }
	  };
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.generateXSRF = generateXSRF;
	exports.verifyXSRF = verifyXSRF;

	var _csrf = __webpack_require__(9);

	var _csrf2 = _interopRequireDefault(_csrf);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const csrf = new _csrf2.default();

	function generateXSRF() {
	  const secret = csrf.secretSync();

	  const token = csrf.create(secret);

	  return {
	    secret,
	    token
	  };
	}

	function verifyXSRF(secret, token) {
	  return csrf.verify(secret, token);
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("csrf");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.encryptPass = encryptPass;
	exports.comparePass = comparePass;

	var _bcryptNodejs = __webpack_require__(11);

	var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Encrypt password for storage
	function encryptPass(password) {
	  return new Promise(function (resolve, reject) {
	    _bcryptNodejs2.default.hash(password, null, null, function (err, hash) {
	      if (err) {
	        return reject(err);
	      }
	      return resolve(hash);
	    });
	  });
	}

	// Decrypt and compare password
	function comparePass(password, storedPass) {
	  return new Promise(function (resolve, reject) {
	    _bcryptNodejs2.default.compare(password, storedPass, function (err, isAuth) {
	      if (isAuth) {
	        resolve(isAuth);
	      } else {
	        reject(err || isAuth);
	      }
	    });
	  });
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("bcrypt-nodejs");

/***/ }
/******/ ]);