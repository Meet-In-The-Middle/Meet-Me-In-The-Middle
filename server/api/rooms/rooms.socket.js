/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rooms = require('./rooms.model');
var RoomsController = require('./rooms.controller');
var io = require('../../app').io;
//var sendgrid  = require('sendgrid')(process.env.SEND_GRID_ACCOUNT, process.env.SEND_GRID_PASSWORD);
var sendgrid = require('../../components/send_grid_email/sendgrid.js');
//data cache for Google Maps markers for all users
var dataCollection = {};

exports.roomSockets = function (socket) {
  var roomId;
  //listener for when client joins room (midup)
  socket.on('join-room', function (data) {
    roomId = data.roomId;
    RoomsController.joinOrUpdateRoomViaSocket(data, function(returnData, err, noUser, noRoomMsg) {
      if( err ) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else if ( noRoomMsg ) {
        socket.emit('error-msg', noRoomMsg);
      } else {
        socket.emit('join-room-reply', returnData);
      }
    });
    socket.join(roomId);
    //get most recent messages for a room and send to client in JSON array
    RoomsController.getRecentChatMessages(roomId, function(messageData, err) {
      if(err) {
        //handle error}
      } else {
        socket.emit('chat-messages', messageData);
      }
    });

    RoomsController.getVotes(roomId, function(locData, err) {
      if(err) {
      } else {
        socket.emit('vote-data', locData);
      }
    });

     // listen for client emitting to event 'roomId' which segregates room
    socket.on(roomId, function(userId, username, message){
      //Call method in rooms.controller.js (which interacts with rooms.model.js)
      RoomsController.updateRoomChats(roomId, userId, username, message, function( messageObj ) {
          io.sockets.in(roomId).emit('server-chat-response', messageObj);
      });
    });
  });
  //listener for submitting emails to invite to join midup
  socket.on('email-invites', function(data, roomId, username, roomName) {
    //use Send Grid service to send email invites
    sendgrid.sendGridEmailInvite(data, roomId, username, roomName);
    //send response back to client of success or error
    socket.emit('email-invites-reply', data);
  });
  //listener for adding possible location
  socket.on('addLoc', function(roomId, locData, userId){
    RoomsController.addLoc(roomId, locData, userId, function(locData) {
      io.sockets.in(roomId).emit('addLoc-reply', locData);
    });
  });
  //listener for voting on a possible location
  socket.on('vote', function(roomId, likeType, userId, locData){
    RoomsController.updateVote(roomId, likeType, userId, locData, function(locData) {
      io.sockets.in(roomId).emit('vote-reply', locData);
    });
  });
  //listener for deleting a midup (if owner)
  socket.on('delete-midup', function(roomId, userId) {
    //call delete room function
    RoomsController.destroy(roomId, userId, function(newMidupList, error) {
      if( error ) {
        socket.emit('delete-midup-reply', null, error);
      } else if( !!newMidupList ) {
        socket.emit('delete-midup-reply', newMidupList, error);
      }
    });
  });
  //listener for client leaving a midup (not the owner)
  socket.on('leave-midup', function(roomId, userId) {
    //remove midup or reload new data
    RoomsController.removeRoomFromUser(roomId, userId, function(newMidupList, error) {
      if( error ) {
        socket.emit('delete-midup-reply', null, error);
      } else if( !!newMidupList ) {
        socket.emit('leave-midup-reply', newMidupList, error);
      }
    });
  });
/////////////////// LISTENERS FOR GOOGLE MAP MARKERS AND INTERACTION  //////////////
  socket.on('move-pin', function(data){

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
      if( err ) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else if ( noRoomMsg ) {
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

///////////////////////////////
  socket.on('disconnect', function(data){
    socket.leave(roomId);
  });

};



