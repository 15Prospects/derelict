import Express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import derelict from '../src';
import { createUser, fetchUser, authRules } from './helpers';

function setupServer(derelictConfig, done) {
  const testServer = Express();

  testServer.use(cookieParser());
  testServer.use(bodyParser.json());

  derelict.setup(derelictConfig);

  testServer.post('/login', derelict.logIn);

  testServer.post('/signup', derelict.signUp);

  testServer.post('/logout', derelict.logOut);
  
  testServer.get('/pass_auth', derelict.isAuth('pass'), (req, res) => {
    res.sendStatus(200);
  });
  
  testServer.get('/fail_auth', derelict.isAuth('fail'), (req, res) => {
    res.sendStatus(200);
  });

  return testServer;
}

export default setupServer;
