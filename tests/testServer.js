import Express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import derelict from '../src';

function setupServer(derelictConfig, done) {
  const testServer = Express();
  let nextCalled = false;

  testServer.use(cookieParser());
  testServer.use(bodyParser.json());

  derelict.setup(derelictConfig);

  testServer.post('/login', derelict.logIn);

  testServer.post('/signup', derelict.signUp, () => {
    nextCalled = true;
  });

  testServer.get('/next-called', (req, res) => {
    res.status(200).json({
      nextCalled
    });
  });

  testServer.post('/logout', derelict.logOut);

  testServer.put('/change-pass', derelict.changePassword);

  testServer.get('/pass_auth', derelict.isAuth('pass'), (req, res) => {
    res.sendStatus(200);
  });

  testServer.get('/fail_auth', derelict.isAuth('fail'), (req, res) => {
    res.sendStatus(200);
  });

  return testServer;
}

export default setupServer;
