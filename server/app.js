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

// inject roomsController here
var RoomsController = require('./api/rooms/rooms.controller');
//data cache for Google Maps markers for all users
var dataCollection = {};

/**
 * Set up all socket.on listeners when client connects to server
 */
io.on('connection', function (socket) {
  //fires when client moves a gmaps marker (pin)
  socket.on('move-pin', function(data){
    //console.log('!!!!!!!!move-pin data ', data);

    if(dataCollection[data.roomId] === undefined){
      dataCollection[data.roomId] = {};
      dataCollection[data.roomId][data._id] = data;
    }
    else{
      dataCollection[data.roomId][data._id] = data;
    }

    var userRoomObj = {
      roomId: data.roomId,
      user: {
        _id: data._id,
        name: data.name,
        coords: {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
        },
        owner: false
      },
      info: 'How awesome',
      active: true
    };
    /**
     * When user loads a MidUp map page (entering a room), add them to room or update their info in DB
     */
    RoomsController.joinOrUpdateRoomViaSocket(userRoomObj, function(returnData, err, noUser, noRoomMsg) {
      console.log('returnData is ', returnData);
      if( err ) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else if ( noRoomMsg ) {
        console.log('noRoom error should be emitted: ', noRoomMsg);
        socket.emit('error', noRoomMsg);
      } else {
        //socket.emit('join-room-reply',  returnData);
      }
    });

    io.sockets.in(data.roomId).emit('move-pin-reply', dataCollection[data.roomId]);

  });
  //listener for client voting on location
  socket.on('vote', function(locKey, userId, room){
    io.sockets.in(room).emit('vote-reply', locKey, userId);
  });
  //listener for client removing vote for location
  socket.on('remove-vote', function(locKey, userId, room) {
    io.sockets.in(room).emit('remove-vote-reply', locKey, userId);
  });
  //listener to move location search circle
  socket.on('circle-move', function(center, room){
    // io.emit('circle-move-replay', center);
    io.sockets.in(room).emit('circle-move-replay', center);
  });
  //listener to change location search circle radius
  socket.on('circle-radius-change', function(radius, room){
    // io.emit('circle-radius-change-reply', radius);
    io.sockets.in(room).emit('circle-radius-change-reply', radius);
  });
  //listener for client doing a place search
  socket.on('place-search', function(request, room){
    // io.emit('place-search-reply', request);
    io.sockets.in(room).emit('place-search-reply', request);
  });

  // Delete the data after disconnecting.
  socket.on('disconnect', function(data){
    //delete dataCollection[socket.id];
    //io.emit('move-pin-reply', dataCollection);
  });
  //the rest of the socket listeners are exported for separation of concerns
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
