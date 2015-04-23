'use strict';

var should = require('should');
<<<<<<< HEAD
var app = require('../../app');
var request = require('supertest');

describe('GET /api/rooms', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/rooms')
=======
//var request = require('supertest');

var http = require('http');
var express = require('express');
var request = require('supertest');

var app = express();
var server = http.createServer(app);


//var express = require('express');
//var app = express();
//var app = require('../../app');
//app = require('http').Server(app);
//app.listen(9000);
//console.log('request is ', request);
describe('POST /api/rooms/adduser', function() {

  it('should respond with JSON object', function(done) {
    request(server)
      .post('/api/rooms/adduser')
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.
