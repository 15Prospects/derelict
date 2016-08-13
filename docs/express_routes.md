# Express Routes Setup

## Log In, Log Out, Sign Up, Change Password Routes

```
router.post('/login', derelict.logIn);

router.post('/logout', derelict.logOut);

router.post('/signup', derelict.signUp);

router.put('/change-pass', derelict.changePassword);
```

## Server Authentication Routes

To protect a route, use derelict.isAuth(rule) as a middleware. This function will generate middleware that:
1. Attaches user data to the request as request.user
1. Runs the authentication rule function specified
    - Calls next middleware if authentication is passed
    - Responds with status 400 if authentication is failed

The rule argument should be a string that matches the name of the authentication rule you want to use on that route that you passed to derelict during setup.

```
// In setup:
const authRules = {
    admin(user, req) {
        return user.role === 'admin';
    }
}

router.get('/restricted', derelict.isAuth('admin'), someOtherMiddleware);
```

If you only want to attach the user object to the request, you can use derelict.attachUser instead

```
// someOtherMiddleware will be able to access user data using request.user
router.get('/userDataRequired', derelict.attachUser, someOtherMiddleware);

```

## next() Middleware
Log In, LogOut, Sign Up and Change Password will call the next middleware if resolved.
The result of Log In, Sign Up and Change Password is attached to the request. Your next middleware
can access this through req.user.

## Next Step

[Sending requests from client side](./client_usage.md)
