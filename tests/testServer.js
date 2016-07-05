import Express from 'express';
import { fetchUser, createUser } from './helpers';
import derelict from '../src';

const testServer = Express();

derelict.setup({

});

app.post('/login', derelict.logOut);

app.post('/signup', derelict.signUp);

app.post('/logout', derelict.logOut);

const port = 3000;

export default testServer.listen(port, () => {
  console.log(`Ready for testing on port ${port}`);
});
