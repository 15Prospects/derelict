import JwtHelpers from './JwtHelpers';
import Authenticator from './Authenticator';
import { encryptPass, comparePass } from './passwordHelpers';
import { generateXSRF } from './xsrfHelpers';

/*
  Authentication Middleware Constructor
  Expects config ={
    secret - JWT secret
    fetchUser - function to fetch a user from database
    createUser - function to create a new user 
    authRules - Object with named functions that return boolean based on user object
  }
 */
export default class Middleware {
  constructor(config) {
    if (config.idField) {
      // handle unique idField
    }

    // Setup middleware
    this.fetchUser = config.fetchUser;
    this.createUser = config.createUser;
    this.jwtHelpers = new JwtHelpers(config.secret);
    this.authRules = config.authRules;

    
    // Initialize checkAuth
    this.checkAuth = Authenticator(this.jwtHelpers, config.authRules);
  }

  handleLogIn(request, response) {
    const { email, password } = request.body;

    function done(error, user) {
      if (error) {
        response.status(400).json(error);
      } else {
        // check password
        comparePass(password, user.password)
          .then(() => {
            // Delete user password before storing in JWT
            delete user.password;
            
            // Generate XSRF and JWT Auth tokens
            const XSRF = generateXSRF();
            const JWT = this.jwtHelpers.generateJWT(user, XSRF.secret);

            // Set Cookies on response
            response.cookie('X-XSRF-HEADER', XSRF.token, { path: '/' });
            response.cookie('jwt', JWT, { path: '/' });
            
            // Respond with user
            response.status(200).json(user);

          })
          .catch(error => {
            response.status(400).json(error);
          })
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

    encryptPass(newUser.password)
      .then(encryptedPass => {
        newUser.password = encryptedPass;
        this.createUser(newUser, (error, user) => {
          if (error) {
            response.status(400).json({ error });
          } else {
            delete user.password;

            // Respond with user object
            response.status(200).json(user); 
          }
        })
      })
      .catch(error => {
        // Error while encrypting password
        response.status(500).json({ error: 'error encrypting pass' });
      })
  }

}
