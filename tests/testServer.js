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

  testServer.put(
    '/reset-pass',
    (req, res) => {
      derelict.resetPassword(req.body)
        .then(() => res.status(200).end())
        .catch(() => res.status(500).end());
    }
  );

  testServer.post('/create_jwt', (req, res) => {
    res
      .secureJWT(req.body.data, {
        maxAge: req.body.testAge,
        name: req.body.testName,
      })
      .then(() => res.status(200).end());
  });

  testServer.post('/decode_jwt', (req, res) => {
    res.status(200).json({ token: req.getSecureJWT(req.body.testName) });
  });

  return testServer;
}

export default setupServer;
