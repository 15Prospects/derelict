# Setup

## Requirements

Derelict requires minimal setup. Only three functions are required to get it up and running.

1. A function the inserts a user into our database
    - Accept a new user object as the first argument
    - It should return a promise
    - It should resolve with a new user object
    - It should reject with an error
    
    Derelict will encrypt the password, call this function to insert the user, and send a response.

    ```
    // By the time this function is called by derelict, the password will already be encrypted
    // newUserData = { email: 'email@email.com' password: 'encryptedPass' }
     
    function createUser(newUserData) {
      return new Promise((resolve, reject) => {
        User
          .insert(newUserData)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
    
    ```
    

1. A function that fetches user data by email 
    - It should return a promise
    - It should resolve with a new user object
    - It should reject with an error

    ```
    // query = { email: 'email@email.com' }
    function fetchUser(query) {
      return new Promise((resolve, reject) => {
        User
          .query()
          .where(query)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
    ```

1. A function that updates user data by ID
    - It should return a promise
    - It should resolve with a new user object
    - It should reject with an error
    
    ```
    // query = { id: 5 }
    // fieldsToUpdate = { password: 'newpassword' }
    function updateUser({ query, fieldsToUpdate }) {
      return new Promise((resolve, reject) => {
        User
          .query()
          .patch(fieldsToUpdate)
          .where(query)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
    ```

1. An object of authentication rule functions
    - Each function will be passed user data and request object
    - Each function should return true or false
    
    ```
    const authRules = {
        admin(user, req) {
            return user.role === 'admin';
        }
        
        basic(user, req) {
            return user.id === req.params.user_id;
        }
    }
    
    ```
    
## Initializing Derelict

```
import derelict from 'derelict';

const authConfig = {
    createUser,
    fetchUser,
    updateUser,
    authRules,
    secret: 'aSecretForEncodingJWT',
    useXSRF: true // You can omit this, the default setting is true
}

derelict.setup(authConfig);
```

## Next Step

[Setup Express Routes](./express_routes.md);
