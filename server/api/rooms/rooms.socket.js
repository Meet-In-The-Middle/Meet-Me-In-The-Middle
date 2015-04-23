/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rooms = require('./rooms.model');
var RoomsController = require('./rooms.controller');
var io = require('../../app').io;
var sendgrid  = require('sendgrid')('midup', '7hZW0cRLUm1K8inC');

exports.roomSockets = function (socket) {
  var roomId;

  socket.on('join-room', function (data) {
    roomId = data.roomId;
    RoomsController.joinOrUpdateRoomViaSocket(data, function (returnData, err, noUser) {
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

<<<<<<< HEAD
    RoomsController.getVotes(roomId, function(locData, err) {
      if(err) {
        console.log('getVotes socket error:', err);
      } else {
        console.log('no error:', locData);
        socket.emit('vote-data', locData);
      }
    });



=======
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.
     // listen for client emitting to event 'roomId' which segregates room
    socket.on(roomId, function(userId, username, message){
      //console.log('####################### in socket.on', userId, username, message);
      //Call method in rooms.controller.js (which interacts with rooms.model.js)
      RoomsController.updateRoomChats(roomId, userId, username, message, function( messageObj ) {
          io.sockets.in(roomId).emit('server-chat-response', messageObj);
      });
    });
  });

  socket.on('email-invites', function(data, roomId, username, roomName) {
    console.log('999email invite data is ', data, roomId, username, roomName);
    var params = {
      //to: 'jsnisenson@gmail.com',
      from: 'jsnisenson@gmail.com',
      subject: 'Jonah Testing Sendgrid Email',
      html: 'You have been invited by ' + username + ' to be a part of this MidUp <a href="http://jn.ngrok.com/mymidups/'+roomId+'">'+roomName+'</a>'
    };
    var email = new sendgrid.Email(params);
    //addTo sends email to everyone in the array but independently (i.e. user won't see other users emails)
    email.addTo(data);
    //send emails and send back to
    sendgrid.send(email, function(err, json) {
      if(err) {console.log('sendgrid error ', err); }
      //Add user to DB as invited
      //var invited =
      console.log('////////sendgrid json ', json);
    });


    socket.emit('email-invites-reply', data);
  });

<<<<<<< HEAD
  socket.on('addLoc', function(roomId, locData, userId){ 
    console.log('updating the db',roomId);
    RoomsController.addLoc(roomId, locData, userId, function(locData) {
      console.log('notifying room of locData');
      io.sockets.in(roomId).emit('addLoc-reply', locData); 
    });
  });

  socket.on('vote', function(roomId, likeType, userId, locData){
    console.log('updating the db like',roomId);
    RoomsController.updateVote(roomId, likeType, userId, locData, function(locData) {
      io.sockets.in(roomId).emit('vote-reply', locData); 
    });  
  });



=======
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.
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

