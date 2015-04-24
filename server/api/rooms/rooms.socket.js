/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rooms = require('./rooms.model');
var RoomsController = require('./rooms.controller');
var io = require('../../app').io;
var sendgrid  = require('sendgrid')(process.env.SEND_GRID_ACCOUNT, process.env.SEND_GRID_PASSWORD);

exports.roomSockets = function (socket) {
  var roomId;
  //listener for when client joins room (midup)
  socket.on('join-room', function (data) {
    roomId = data.roomId;
    RoomsController.joinOrUpdateRoomViaSocket(data, function(returnData, err, noUser, noRoomMsg) {
      console.log('returnData is ', returnData);
      if( err ) {
        socket.emit('error', err);
      } else if (noUser) {
        socket.emit('error', 'UserId was not sent with or was undefined in request');
      } else if ( noRoomMsg ) {
        console.log('noRoom error should be emitted: ', noRoomMsg);
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
        console.log('getVotes socket error:', err);
      } else {
        console.log('no error:', locData);
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
    console.log('999email invite data is ', data, roomId, username, roomName);
    var params = {
      //to: 'jsnisenson@gmail.com',
      from: 'jsnisenson@gmail.com',
      subject: 'Invitation to MidUp',
      html: 'Hello, <br><br> ' +
      'You have been invited by ' + username + ' to be a part of this MidUp <a href="' + process.env.DOMAIN + '/mymidups/'+roomId+'">'+roomName+'</a><br><br>' +
      'MidUp helps you, your colleagues and your friends interactively find the perfect place to meet up in the middle.' + '<br><br>' +
      'If the link above does not work, copy and paste this link into a browser to join the MidUp:' + '<br><br>' +
      '' + process.env.DOMAIN + '/mymidups/'+roomId  + '' + '<br><br>' +
      '- The MidUp Team'

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

    //send response back to client of success or error
    socket.emit('email-invites-reply', data);
  });
  //listener for adding possible location
  socket.on('addLoc', function(roomId, locData, userId){
    console.log('updating the db',roomId);
    RoomsController.addLoc(roomId, locData, userId, function(locData) {
      console.log('notifying room of locData');
      io.sockets.in(roomId).emit('addLoc-reply', locData);
    });
  });
  //listener for voting on a possible location
  socket.on('vote', function(roomId, likeType, userId, locData){
    console.log('updating the db like',roomId);
    RoomsController.updateVote(roomId, likeType, userId, locData, function(locData) {
      io.sockets.in(roomId).emit('vote-reply', locData);
    });
  });
  //listener for deleting a midup (if owner)
  socket.on('delete-midup', function(roomId, userId) {
    console.log('roomId in sockets is ', roomId);
    console.log('userId in sockets is ', userId);
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

  socket.on('disconnect', function(data){
    socket.leave(roomId);
  });

};



