import request from 'supertest';
import { assert } from 'chai';
import setupServer from './testServer';
import { createUser, fetchUser, updateUser, authRules, next } from './helpers';

const defaultConfig = {
  createUser,
  fetchUser,
  updateUser,
  authRules,
  secret: 'testymctestface',
  next
};

let server;
let agent;

describe('Derelict', () => {
  describe('Authentication without XSRF', () => {
    before((done) => {
      const derelictConfig = Object.assign({}, defaultConfig, {
        xsrf: false
      });

      server = setupServer(derelictConfig).listen(1337, () => {
        console.log('Server ready for testing on port 1337');
        agent = request.agent(server);
        done();
      });
    });

    after((done) => {
      server.close(done);
    });

    it('Should let users signup', (done) => {
      agent
        .post('/signup')
        .send({ email: 'test@email.com', password: 'test' })
        .expect(200)
        .end((err, res) => {
          assert(res.body.email === 'test@email.com');
          assert(!res.body.password);
          done();
        });
    });

    it('Should let users login', (done) => {
      agent
        .post(`/login`)
        .send({ email: 'test@email.com', password: 'test' })
        .expect(200)
        .end((err, res) => {
          const cookies = res.headers['set-cookie'];
          assert.lengthOf(cookies, 1);
          assert.match(cookies[0], /jwt/);
          done();
        });
    });

    it('Should let users access protected routes', (done) => {
      agent
        .get('/pass_auth')
        .expect(200, done);
    });

    it('Should block users from accessing route above their pay-grade', (done) => {
      agent
        .get('/fail_auth')
        .expect(401, done);
    });

    it('Should clear cookies when users logout', (done) => {
      agent
        .post('/logout')
        .expect(200)
        .end((err, res) => {
          const cookies = res.headers['set-cookie'];
          assert.lengthOf(cookies, 1);
          assert.match(cookies[0], /jwt/);
          assert.match(cookies[0], /Expires/);
          done();
        });
    })
  });

  describe('Authentication with XSRf', () => {
    let xsrfCookie = '';

    before((done) => {
      server = setupServer(defaultConfig).listen(1337, () => {
        console.log('Server ready for testing on port 1337');
        agent = request.agent(server);
        done();
      });
    });

    after((done) => {
      server.close(done);
    });

    it('Should let users signup', (done) => {
      agent
        .post('/signup')
        .send({ email: 'test@email.com', password: 'test' })
        .expect(200)
        .end((err, res) => {
          assert(res.body.email === 'test@email.com');
          assert(!res.body.password);
          done()
        });
    });

    it('Should let users login', (done) => {
      agent
        .post(`/login`)
        .send({ email: 'test@email.com', password: 'test' })
        .expect(200)
        .expect((res) => {
          const cookies = res.headers['set-cookie'];
          assert.lengthOf(cookies, 2);
          assert.match(cookies[0], /jwt/);
          assert.match(cookies[1], /X\-XSRF\-HEADER/);
        })
        .end((err, res) => {
          const parts = ('; ' + res.headers['set-cookie'][1]).split("; X-XSRF-HEADER=");
          xsrfCookie = parts.pop().split(";").shift();
          done();
        });
    });

    it('Should let users access protected routes', (done) => {
      agent
        .get('/pass_auth')
        .set({ xsrf: xsrfCookie })
        .expect(200, done);
    });

    it('Should block users from accessing route above their pay-grade', (done) => {
      agent
        .get('/fail_auth')
        .set({ xsrf: xsrfCookie })
        .expect(401, done);
    });

    it('Should clear cookies when users logout', (done) => {
      agent
        .post('/logout')
        .expect(200)
        .end((err, res) => {
          const cookies = res.headers['set-cookie'];
          assert.lengthOf(cookies, 2);
          assert.match(cookies[0], /jwt/);
          assert.match(cookies[1], /X\-XSRF\-HEADER/);
          assert.match(cookies[0], /Expires/);
          assert.match(cookies[1], /Expires/);
          done();
        });
    });

    it('Should let users change their password', (done) => {
      agent
        .put('/change-pass')
        .send({ id: 4, password: 'test', new_password: 'newtest' })
        .expect(200)
        .end((err, res) => {
          assert(res.body.email === 'test@email.com');
          assert(!res.body.password);

          agent
            .post(`/login`)
            .send({ email: 'test@email.com', password: 'newtest' })
            .expect(200)
            .end(() => {
              done();
            });
        });
    });

  });

  // http://stackoverflow.com/questions/30625404/how-to-unit-test-console-output-with-mocha-on-nodejs
  describe('Calls next middleware conditionally', () => {
    before(done => {
      server = setupServer(defaultConfig).listen(1337, () => {
        console.log('Server ready for testing on port 1337');
        agent = request.agent(server);
        done();
      });
    });

    after(done => {
      server.close(done);
    });

    it('Should call next', done => {
      agent
        .post('/signup-next')
        .send({ email: 'test@email.com', password: 'test' })
        .expect(200)
        .end((err, res) => {
          assert(res.body.email === 'test@email.com');
          assert(!res.body.password);
        });

      setTimeout(() => {
        agent
        .get('/next-called')
        .expect(200)
        .end((err, res) => {
          assert(res.body.nextCalled === true);
          done();
        });
      }, 2000);
    });
  });
});
