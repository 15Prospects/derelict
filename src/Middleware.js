import Authenticator from './Authenticator';

/*
  Authentication Middleware Constructor
  Expects config ={
    secret - JWT secret
    fetchUser - function to fetch a user from database
    createUser - function to create a new user 
    authRules - Object with named functions that return boolean based on user object
    useXsrf - Use XSRF protection, defaults to true
  }
 */
export default class Middleware {
  constructor({ fetchUser, createUser, secret, authRules = [], useXsrf = true }) {

    // Setup middleware
    this.fetchUser = fetchUser;
    this.createUser = createUser;
    this.useXsrf = useXsrf;
    this.authenticator = new Authenticator({
      secret,
      authRules,
      useXsrf
    });

    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleLogIn = this.handleLogIn.bind(this);
  }

  handleLogIn(request, response) {
    const { email, password } = request.body;

    this.fetchUser(email, (error, user) => {
      if (error) {
        // Error fetching user
        response.status(400).json(error);
      } else {
        this.authenticator.logIn(user, password)
          .then(tokens => {
            // Set Cookies on response
            response.cookie('jwt', tokens.JWT, { path: '/' });
            
            if (this.useXsrf) {
              response.cookie('X-XSRF-HEADER', tokens.XSRF, { path: '/' });
            }

            // Respond with user
            response.status(200).json(user);
          })
          .catch(error => {
            response.status(400).json(error);
          });
      }
    });
  }

  // Clear cookies on response
  handleLogOut(request, response) {
    response.clearCookie('jwt', { path: '/' });
    
    if (this.useXsrf) {
      response.clearCookie('X-XSRF-HEADER', { path: '/' });  
    }
    
    response.status(200).end();
  }

  handleSignUp(request, response) {
    const newUser = request.body;

    this.authenticator.encryptPass(newUser)
      .then(user => {
        this.createUser(user, (error, user) => {
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
        // Error encrypting password
        response.status(500).json(error);
      });
  }
}
