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
    RoomsController.addUserToRoomOrUpdate(data, function (returnData, err, noUser) {
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
    //get most recent messages for a room and send to client in JSON array
    RoomsController.getRecentChatMessages(roomId, function(messageData, err) {
      if(err) {
        //handle error}
      } else {
        socket.emit('chat-messages', messageData);
      }
    });


     // listen for client emitting to event 'roomId' which segregates room
    socket.on(roomId, function(userId, username, message){
      //console.log('####################### in socket.on', userId, username, message);
      //Call method in rooms.controller.js (which interacts with rooms.model.js)
      RoomsController.updateRoomChats(roomId, userId, username, message, function( messageObj ) {
          io.sockets.in(roomId).emit('server-chat-response', messageObj);
      });
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


