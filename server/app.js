/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
//Ko: Socket is hooked here
// var socketio = require('socket.io')(server, {
//   serveClient: (config.env === 'production') ? false : true,
//   path: '/socket.io-client'
// });
// //Ko: Server-side socket logic is defined here in ./config/socketio.js
// require('./config/socketio')(socketio);
var socket = require('socket.io');
var io = socket(server);

io.on('connection', function(socket){

  socket.on('move-pin', function(data){
    // do stuff with data received from cliend

    socket.emit('move-pin', data)
    console.log('TESTING SOCKET.IO' + socket.id)

  })
})


require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;