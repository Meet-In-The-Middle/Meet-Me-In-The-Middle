'use strict';

var _ = require('lodash');
var Rooms = require('./rooms.model').Rooms;
var RoomUser = require('./rooms.model').RoomUser;
var User = require('../user/user.model')

// Get list of rooms. Not currently used
exports.index = function (req, res) {
};

/**
 * @desc  Find all the rooms (midups) that a user is a part of.
 * @param req
 * @param res
 */
exports.show = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (!err) {
      var rooms = user.memberOfRooms;
      res.send(200, rooms);
    } else {
      res.send('error');
    }
  });

};

/**
 * @desc  Creates a new room in the Rooms Collection and also adds the room to 'memberOfRooms' property
 *  in for user in User Collection
 * @param req
 * @param res
 */
exports.createRoom = function (req, res) {
  var newRoom = {
    name: req.body.name,
    info: req.body.info,
    active: req.body.active,
    users: [req.body.user]
  };
  //create new roomId to user data in user collection
  Rooms.create(newRoom, function (err, room) {
    if (err) {
      return handleError(res, err);
    }
    else {
      //add room to in users collection
      //User.findById(req.body.user._id, function (err, user) {
      User.findById(req.body.user.userId, function (err, user) {
        var roomId = room._id.toString();
        user.memberOfRooms.push({roomId: roomId, name: req.body.name, info: req.body.info, createdAt: room.createdAt, owner: true });
        user.save(function (err) {
          if (err) { console.log('err within create in rooms.controller is ', err);};
          //res.send(200);
        });
      });
    }
    //call method in rooms.socket.js to create listener for chat in specific room
    //RoomSockets.createRoomListener(roomId);
    return res.json(201, room);
  });
};


// Deletes a rooms from the DB.
/**
 * @desc  Delete a room (midup)
 * @param roomId String
 * @param userId String
 * @param callback Send data back to client that room deleted
 */
exports.destroy = function (roomId, userId, callback) {
  Rooms.findById(roomId, function (err, room) {
    if (err) {
      //send error back to client
      //return handleError(res, err);
      callback(null, err);
    }
    if (!room) {
      //send message to client that room does not exist
      //return res.send(404);
      callback(null, 'midup room does not exist');
      return;
    }
    var roomUsers = room.users, usersObj = [];
    for( var i = 0, len = roomUsers.length; i < len; i++ ) {
      //iterate over users in room and get userIds from users memberOfRooms
      usersObj.push(roomUsers[i]);
    }
    for( var j = 0, length = usersObj.length; j < length; j++ ) {
      User.findById(usersObj[j].userId, function(err, user) {
        if( err ) { console.log(err); }
        if( !!user ) {
          for( var k = 0; k < user.memberOfRooms.length; k++ ) {
            if( user.memberOfRooms[k].roomId === roomId ) {
              user.memberOfRooms.splice(k, 1);
            }
          }
        }
        user.save(function(err, newData) {
          if( !err) {
            if( newData._id === userId ) {
              //callback(newData.memberOfRooms);
            }
          }
        });
      });
    }
    room.remove(function (err) {
      if (err) {
        callback(null, err);
      }
      //send back room was removed
      //callback('Midup was removed');
      else if (!err) {
        callback(roomId);
      }
    });
  })
};

/**
 * @decs  Remove a room from the rooms a member is a user in in the User Collection
 * @param roomId String
 * @param userId String
 * @param callback send data back to user
 */
exports.removeRoomFromUser = function(roomId, userId, callback) {
  Rooms.findById(roomId, function (err, room) {
    if (err) {
      //send error back to client
      //return handleError(res, err);
      callback(null, err);
    }
    if (!room) {
      //send message to client that room does not exist
      //return res.send(404);
      callback(null, 'midup room does not exist');
      return;
    }
    var roomUsers = room.users;
    for( var i = 0, len = roomUsers.length; i < len; i++ ) {
      //iterate over users in room and delete the user object
      if( roomUsers[i].userId === userId ) {
        roomUsers.splice(i, 1);
        break;
      }
    }
    room.users = roomUsers;
    room.save(function(err, room) {
      if( err ) console.log(err);
      User.findById(userId, function(err, user) {
        if( err ) { console.log(err); }
        if( !!user ) {
          for( var k = 0; k < user.memberOfRooms.length; k++ ) {
            if( user.memberOfRooms[k].roomId === roomId ) {
              user.memberOfRooms.splice(k, 1);
            }
          }
        }
        user.save(function(err, newData) {
          if( !err) {
            callback(newData.memberOfRooms);
          }
        });
      });
    });
  })
};


/**
 * Function is called by socket.io listener to get users for a Room (with all data)
 * @param data Object
 * @param cb
 */
exports.getUsersForRoom = function (data, cb) {
  var userId = data.userId;
  var roomId = data.roomId;
  Rooms.findById(roomId, function (err, room) {
    if (err) {
      console.log('getUsersForRoom in rooms.controller ', err);
    }
    if (!room) {
      console.log('theres no room dude... im in getUsersForRoom in rooms.controller');
    }
    var usersObj = room.users.reduce(function (a, b) {
      a[b._id] = b;
      return a;
    }, {});
    cb(usersObj);
  });
};

/**
 * Handler for socket.io 'join-room'. Adds user to room in Rooms Collection and adds room to user object
 * in User Collection
 * @param userRoomObj
 * @param cb -- callback used to send data back to client
 */
exports.joinOrUpdateRoomViaSocket = function (userRoomObj, cb) {
  var userId = userRoomObj.user._id;
  var roomId = userRoomObj.roomId;
  addUserToRoomOrUpdateRoom(userId, roomId, userRoomObj, cb);
};
/**
 * @desc  Save room (midup) chats to database per room
 * @param roomId STring
 * @param userId String
 * @param username String
 * @param message String
 * @param callback
 */
exports.updateRoomChats = function(roomId, userId, username, message, callback){
  //Create the message object
  var chatObj = {
    userId: userId,
    username: username,
    message: message,
    date: new Date()
  };
  //push new chat message to MidUp room messages array
  Rooms.update(
    { "_id": roomId },
    { "$push": {"messages": chatObj }},
    function(err, numAffected){
      if(err){
        console.log('updateRoomChats error:' + err);
      } else {
        callback(chatObj);
      }
    }
  );
};
/**
 * @desc  Get most recent 100 chat messages for a room
 * @param roomId String
 * @param callback: send data back to server
 */
exports.getRecentChatMessages = function(roomId, callback) {
  Rooms.findById(roomId, function(err, room) {
    if(err){
      console.log(err);
    } else if ( !!room ) {
      var messages = room.messages.slice(0, 100);
      callback(messages, err);
    }
  });
};
/**
 * @desc Change or update vote for location to meet up
 * @param roomId String
 * @param likeType String
 * @param userId String
 * @param locData
 * @param callback send data back to client
 */
exports.updateVote = function(roomId, likeType, userId, locData, callback){
  Rooms.findById(roomId, function(err, room) {
    if(err){
      console.log('updateVote Error:' + err);
    } else {
      var locations = room.locations;
      var returnloc = {};
      locations.forEach(function(x){
        if(x.id === locData.id) {
          if(!(_.contains(x.voters, userId)) || likeType === -1) {
            x.votes = x.votes + likeType;
            if(likeType === 1){
              x.voters.push(userId);
            } else {
              x.voters = _.without(x.voters, userId);
            }
          }
          returnloc = x;
        }
      });
      room.locations = locations;
      room.save();
      callback(returnloc);
    }
  });
};
/**
 * @desc  Add possible location to meet
 * @param roomId String
 * @param locData Obj
 * @param userId String
 * @param callback  Send data back to client
 */
exports.addLoc = function (roomId, locData, userId, callback){
  var found = 0;
  Rooms.findById(roomId, function(err, room) {
    if(err){
    } else {
      for(var x = 0; x < room.locations.length; x++){
        if(room.locations[x].id === locData.id){
          exports.updateVote(roomId, 1, userId, locData, callback);
          found = 1;
          break;
        }
      }
      if(!found){
        Rooms.update(
          { "_id": roomId },
          { "$push": {"locations": locData }},
          function(err, numAffected){
            if(err){
              console.log('updateVotes error:' + err);
            } else {
              callback(locData);
            }
          });
      }
    }
  });
};
/**
 * @desc  Get votes for locations per Room
 * @param roomId String
 * @param callback Send data back to client
 */
exports.getVotes = function(roomId, callback) {
  Rooms.findById(roomId, function(err, room) {
    if(err){
      console.log('getVotes Error:' + err);
    } else if ( !!room ) {;
      callback(room.locations);
    }
  });
};

/**
 * @desc  When user loads a room (midup) check to see if already a user, if not add. Update user data including location coords
 * @param userId string
 * @param roomId string
 * @param userRoomObj obj
 * @param cb  callback function
 */
function addUserToRoomOrUpdateRoom(userId, roomId, userRoomObj, cb) {
  var roomName;
  var query = {'_id': roomId, 'users.userId': userId};
  var update = { 'userId': userId,
    'name': userRoomObj.user.name,
    'coords': { 'latitude': userRoomObj.user.coords.latitude, 'longitude': userRoomObj.user.coords.longitude },
    'owner': userRoomObj.user.owner,
    'imageUrl': userRoomObj.user.imageUrl
  };
  //Query Rooms for a room that has specific user; if user does not exist, push user to users array
  //if user exists, update user data
  Rooms.findOne(query,
    function(err, query) {
      if( err ) { console.dir('ERROR IN addUserToRoomOrUpdateRoom, ', err);}
      //if user in room does not exist
      else if( !query ) {
        Rooms.findById(roomId, function(err, room) {
          if( err) console.log('ERROR in findById inside addUserToRoomOrUpdateRoom ', err);
          else if( !room ) {
            cb(null, null, null, 'midup does not exist or has been deleted');
            return;
          } else {
            roomName = room.name;
            var roomInfo = room.info;
            var createdAt = room.createdAt;
            room.users.push(update);
            room.save(function(err, data) {
              if(err) console.log('error in room.save in addUserToRoomOrUpdateRoom ', err);
              else {
                //add room to user.isMemberOf in User Collection
                User.findById(userId, function (err, user) {
                  if (err) {
                    console.log('error in updating User Coll. in  addUserToRoomOrUpdateRoom ', err);
                    return cb(_, err);
                  } else if (user === null || user === undefined) {
                    //return cb(_, _, true);
                  }
                  else {
                    var flag = false;
                    var userInRooms = user.memberOfRooms;
                    for (var i = 0, len = userInRooms.length; i < len; i++) {
                      if (user.memberOfRooms[i].roomId === roomId) {
                        flag = true;
                        break;
                      }
                    }
                    if(!flag) {
                      user.memberOfRooms.push({roomId: roomId, name: roomName, info: room.info, createdAt: room.createdAt, owner: false });
                      user.save(function (err) {
                        if (err) {
                          return cb(_, err);
                        }
                      });
                    }
                  }
                });
                //create object of user objects to send back to client
                var usersObj = data.users.reduce(function (a, b) {
                  a[b.userId] = b;
                  return a;
                }, {});
                cb(usersObj);
              }
            });
          }
        });
      }
      //else update user already in room
      else {
        var userArray = query.users;
        for(var i = 0, len = userArray.length; i < len; i++) {
          if(userArray[i].userId === userId) {
            userArray[i].name = update.name;
            if( update.coords.longitude !== "" || update.coords.latitude !== "") {
              userArray[i].coords = update.coords;
            }
            userArray[i].owner = update.owner;
            userArray[i].imageUrl = update.imageUrl;
          }
        }
        query.users = userArray;
        query.save(function(err, data) {
          if(err) console.log('error saving query.save in addUserToRoomOrUpdateRoom ', err);
          else {
            //create Object of user objects to send to client to populate map markers
            var usersObj = data.users.reduce(function (a, b) {
              a[b.userId] = b;
              return a;
            }, {});
            cb(usersObj);
          }
        });
      }
    }
  );
}

