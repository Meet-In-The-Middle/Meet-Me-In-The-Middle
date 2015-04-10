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
var rooms


//temporary inject roomsController here
var RoomsController = require('./api/rooms/rooms.controller');


var dataCollection = {};
io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
  //   console.log('inside socket connection ', data);
  // });


  socket.on('move-pin', function(data){
    // If it's new socket.id
    // dataCollection[data.roomId] = {};
    // dataCollection[data.roomId][data._id] = data;
    console.log('move-pin data ', data);
    // console.log(JSON.stringify(data._id));
    dataCollection[data._id] = data;
    console.log('dataCollection: ', dataCollection);
    // console.log('server socket', socket.id);
    // console.log(data);
    // console.log('server data received: ', data);
    // console.log('data collection: ', dataCollection);

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

    console.log('User Room Obj:', userRoomObj);
    //Update Database with new info (coords) but don't send data back
    //Data will be sent back from Data Cache for performance reasons

    RoomsController.addUserToRoomOrUpdate(userRoomObj, function(usersData) {
       console.log('UPDATE ROOM - USRS DATA: ', usersData);
       //do something with usersData maybe
    });

    // Sendback all the data
    //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}
    io.emit('move-pin-reply', dataCollection);

    // Testing
    //socket.emit('move-pin', data);
    // console.log('TESTING SOCKET.IO' + socket.id);
    // console.dir(dataCollection);
    
    socket.on('circle-move', function(center){
      io.emit('circle-move-replay', center);
    });

    socket.on('circle-radius-change', function(radius){
      io.emit('circle-radius-change-reply', radius);
    });

    socket.on('place-search', function(request){
      io.emit('place-search-reply', request);
    });


  });

  //socket.on('updateMap', function(data) {
  //   console.log('data is ', data);
  //   var userRoomObj = {
  //     roomId: data.roomId,
  //     userId: data._id
  //   };
  //   RoomsController.getUsersForRoom(userRoomObj, function(usersData) {
  //   //return object of objects indexed by userId
  //   console.log('!!!!!!USERS DATA for ALL IN ROOM!!! ', usersData);
  //     io.emit('updateMapReply', usersData);
  //   });
  //
  //});

  socket.on('join-room', function(data) {
    console.log('join-room data', data);
    RoomsController.addUserToRoomOrUpdate(data, function(returnData, err, noUser) {
      if( err ) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else {
        socket.emit('join-room-reply',  returnData);
      }
    })
  });

  // Delete the data after disconnecting.
  socket.on('disconnect', function(data){
    delete dataCollection[socket.id];
    io.emit('move-pin-reply', dataCollection);
  })
});



require('./config/express')(app);
require('./routes')(app);


server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});



// Expose app and io
exports.app = app;
exports.io = io;
