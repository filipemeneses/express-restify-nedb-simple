const request = require('supertest');
const express = require('express')
const bodyParser = require('body-parser')
const Datastore = require('nedb')
const restify = require('../src/express-restify-nedb-simple.js')

const usersModel = new Datastore('spec/users.db')
const genApp = (customResponse) => {
  const app = express()
  const router = express.Router()

  app.use(bodyParser.json())
  restify.serve(router, usersModel, customResponse)

  app.use('/api', router)

  return app
}
const app = genApp()
let user = null

beforeAll((done) => {
  usersModel.loadDatabase(err => {
    if (err) return done(err)
    usersModel.remove({}, { multi: true }, function (err, numRemoved) {
      done(err)
    });
  });
});

describe('integration', () => {
  test('should insert', (done) => {
    request(app).post('/api/users')
    .send({
      name: 'User name',
      email: 'user@email.com'
    })
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);
      expect(res.body.data.name).toBe('User name');
      expect(res.body.data.email).toBe('user@email.com');

      user = res.body.data

      done();
    });
  })
  test('should get list', (done) => {
    request(app).get('/api/users')
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      done();
    });
  })
  test('should get by id', (done) => {
    request(app).get('/api/users/' + user._id)
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.name).toBe('User name');
      expect(res.body.data.email).toBe('user@email.com');
      done();
    });
  })
  test('should get with query', (done) => {
    request(app).post('/api/users')
    .send({
      name: 'Specific user name'
    })
    .end(function(err, res) {
      request(app).get('/api/users')
      .query({ name: 'Specific user name' })
      .end(function(err, res) {
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.ok).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data[0].name).toBe('Specific user name');
        done();
      });
    });
  })
  test('should update', (done) => {
    request(app).put('/api/users/' + user._id)
    .send({
      name: 'Other name'
    })
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.name).toBe('Other name');
      expect(res.body.data.email).toBe('user@email.com');
      done();
    });
  })
  test('should count', (done) => {
    request(app).get('/api/users/count')
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);
      expect(res.body.data).toBe(2);
      done();
    });
  })
  test('should delete', (done) => {
    request(app).delete('/api/users/' + user._id)
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.ok).toBe(true);

      request(app).get('/api/users/' + user._id)
      .end(function(err, res) {
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.ok).toBe(true);
        expect(res.data).toBe(undefined);
        done();
      });
    });
  })
})

describe('customizations', () => {
  const app = genApp((result) => {
    return {
      success: true,
      result
    }
  })
  test('should allow custom success function', (done) => {
    request(app).get('/api/users')
    .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      expect(res.body.result).toBeInstanceOf(Array);
      expect(res.body.success).toBe(true);
      done();
    });
  })
})
