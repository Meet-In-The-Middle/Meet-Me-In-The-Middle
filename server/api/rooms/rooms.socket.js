/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rooms = require('./rooms.model');
var RoomsController = require('./rooms.controller');
var io = require('../../app').io;

exports.roomSockets = function (socket) {
  var roomId;

  socket.on('join-room', function (data) {
    roomId = data.roomId;
    console.log('join-room data ', data);
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
    socket.join(roomId);
/*
    // echo to client they've connected
    socket.emit('serversend', 'SERVER, you have connected to ' + roomId);
    //broadcast to room members (other than this client) that new user
    socket.broadcast.to(roomId).emit('serversend', 'jonah', '5555 everyone in room EXCEPT client should see this');
*/

    /**
     * listen for client emitting to event 'roomId' which segregates rooms
     */
    socket.on(roomId, function(userId, username, message){
      console.log('####################### in socket.on', userId, username, message);
      //Call method in rooms.controller.js (which interacts with rooms.model.js)
      RoomsController.updateRoomChats(roomId, userId, username, message);
      io.sockets.in(roomId).emit('serversend',username, message);
    });

  });

  socket.on('disconnect', function(data){
    socket.leave(roomId);
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


