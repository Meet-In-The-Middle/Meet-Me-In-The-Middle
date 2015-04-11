/**
 * Broadcast updates to client when the model changes
 */

'use strict';
//var io = require('../app.js').io;

var Rooms = require('./rooms.model');

var RoomsController = require('./rooms.controller');

module.exports = function(socket) {
    socket.on('join-room', function(data) {
      console.log('join-room data', data);
      RoomsController.addUserToRoomOrUpdate(data, function (returnData, err, noUser) {
        console.log('returnData is ', returnData);
        if (err) {
          socket.emit('error', err);
        } else if (noUser) {
          socket.emit('error', 'UserId was not sent with or was undefined in request');
        } else {
          socket.emit('join-room-reply', returnData);
        }
      });
    });


  var midUpRoomChat = function(roomNumber) {
    socket.on(roomNumber, function(data) {

    });
  };

    socket.on('chat', function(message) {

    });





};


//exports.register = function(socket) {
//  Rooms.schema.post('save', function (doc) {
//    onSave(socket, doc);
//  });
//  Rooms.schema.post('remove', function (doc) {
//    onRemove(socket, doc);
//  });
//}
//
//function onSave(socket, doc, cb) {
//  socket.emit('rooms:save', doc);
//}
//
//function onRemove(socket, doc, cb) {
//  socket.emit('rooms:remove', doc);
//}
