/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/**
 * Socket.io connection by client
 */
io.on('connection', function (socket) {
  //all socket listeners are exported to room.socket.js
  var roomSockets = require('./api/rooms/rooms.socket.js')
  roomSockets.roomSockets(socket);
});

require('./config/express')(app);
require('./routes')(app);


server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app and io
exports.app = app;
exports.io = io;
