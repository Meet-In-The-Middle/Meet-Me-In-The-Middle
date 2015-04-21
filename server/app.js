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

//server.listen(config.port, config.ip, function () {
//  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
//});

//Socket.io methods for rooms
// var rooms


//temporary inject roomsController here
var RoomsController = require('./api/rooms/rooms.controller');


var dataCollection = {};
io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
  //   console.log('inside socket connection ', data);
  // });


  socket.on('move-pin', function(data) {
    // If it's new socket.id
    // dataCollection[data.roomId] = {};
    // dataCollection[data.roomId][data._id] = data;
    console.log('!!!!!!!!move-pin data ', data);
    // console.log(JSON.stringify(data._id));
    // var userId = data._id;

    //dataCollection[data._id] = data;

    if (dataCollection[data.roomId] === undefined) {
      dataCollection[data.roomId] = {};
      dataCollection[data.roomId][data._id] = data;
    }
    else {
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

    RoomsController.joinOrUpdateRoomViaSocket(userRoomObj, function (returnData, err, noUser) {
      //console.log('returnData is ', returnData);
      if (err) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else {
        //socket.emit('join-room-reply',  returnData);
      }
    });


    // Sendback all the data
    //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}

    // io.emit('move-pin-reply', dataCollection);
    // io.emit('move-pin-reply', dataCollection[data.roomId]);
    io.sockets.in(data.roomId).emit('move-pin-reply', dataCollection[data.roomId]);
    // socket.on(data.roomId)
  });

    socket.on('vote', function(locKey, userId, room){
      io.sockets.in(room).emit('vote-reply', locKey, userId);
    });

    socket.on('remove-vote', function(locKey, userId, room) {
      io.sockets.in(room).emit('remove-vote-reply', locKey, userId);
    });

    // socket.on('circle-move', function(center, room){
    //   // io.emit('circle-move-replay', center);
    //   io.sockets.in(room).emit('circle-move-replay', center);
    // });

    // socket.on('circle-radius-change', function(radius, room){
    //   // io.emit('circle-radius-change-reply', radius);
    //   io.sockets.in(room).emit('circle-radius-change-reply', radius);
    // });

    // socket.on('place-search', function(request, room){
    //   // io.emit('place-search-reply', request);
    //   io.sockets.in(room).emit('place-search-reply', request);
    // });

    socket.on('vote', function(locKey, userId, room){
      io.sockets.in(room).emit('vote-reply', locKey, userId);
    });

    socket.on('remove-vote', function(locKey, userId, room) {
      io.sockets.in(room).emit('remove-vote-reply', locKey, userId);
    });

    socket.on('circle-move', function(center, room){
      // io.emit('circle-move-replay', center);
      io.sockets.in(room).emit('circle-move-replay', center);
    });

    socket.on('circle-radius-change', function(radius, room){
      // io.emit('circle-radius-change-reply', radius);
      io.sockets.in(room).emit('circle-radius-change-reply', radius);
    });

    socket.on('place-search', function(request, room){
      // io.emit('place-search-reply', request);
      io.sockets.in(room).emit('place-search-reply', request);

    });


  // Delete the data after disconnecting.
  socket.on('disconnect', function(data){
    //delete dataCollection[socket.id];
    //io.emit('move-pin-reply', dataCollection);
  });

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
