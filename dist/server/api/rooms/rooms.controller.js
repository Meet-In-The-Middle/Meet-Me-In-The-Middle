'use strict';

var _ = require('lodash');
var Rooms = require('./rooms.model');
var User = require('../user/user.model')

// Get list of rooms
exports.index = function(req, res) {
  console.log('got into index');
  console.log('req.params', req.params);
/*  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });*/


  /*Rooms.find(function (err, roomss) {
    if(err) { return handleError(res, err); }
    return res.json(200, roomss);
  });*/
};

// Get a single rooms' user objects
exports.show = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(!err ) {
      var rooms = user.memberOfRooms;
      res.send(200, rooms);
    } else {
      res.send('error');
    }
  });

};

// Creates a new rooms in the DB.
exports.create = function(req, res) {
  /*var roomOne = {
    name: 'Friday Night Hangout',
    users: [
      {
        _id: '551eda03095613233a022027',
        name: 'jonahDog',
        latitude: 52.2058804,
        longitude: 0.1453831999999693,
        owner: true
      }],
    info: 'How awesome',
    active: true
  };*/
  //create new roomId to user data in user collection
  Rooms.create(req.body, function(err, room) {
    console.log('req.body.users[0]._id ', req.body);
    if(err) { return handleError(res, err); }
    else {
      //add room to in users collection
      User.findById(req.body.users[0]._id, function (err, user) {
          console.log('user is ', user);
          user.memberOfRooms.push({roomId: room._id, name: req.body.name});
          user.save(function(err) {
            if (err) return validationError(res, err);
            //res.send(200);
          });
        });
    }
    return res.json(201, room);
  });
};

/*var userRoomObj = {
  roomId: roomId,
  user: {
    _id: user._id,
    name: user.name,
    coords: {
      latitude: 54.2058804,
      longitude: long+1,
    },
    owner: false
  },
  info: 'How awesome',
  active: true
};*/


// Updates an existing room in the DB.
exports.update = function(req, res) {
  console.log('called update');
  var userId = req.body.user._id;
  var roomId = req.body.roomId;
  Rooms.findById(roomId, function (err, room) {
    if (err) { return handleError(res, err); }
    if(!room) { return res.send(404); }
    var updated;
    var preExistingUser = false;
    room.users.forEach(function(user, index) {
      if( user._id === userId ) {
        updated = _.merge(user, req.body.user);
        preExistingUser = true;
      }
    });
    if( !preExistingUser ) {
      updated = room.users.push(req.body.user);
    }
    room.save(function (err) {
      if (err) { return handleError(res, err); }
      else {
        User.findById(userId, function (err, user) {
          console.log('user is ', user);
          for( var i = 0, len = user.memberOfRooms.length; i < len ; i++ ) {
            if( user.memberOfRooms[i].roomId === roomId ) {
              return new Error('user already a member of this room');
            }
          }
          user.memberOfRooms.push({roomId: roomId, name: req.body.name});
          user.save(function(err) {
            if (err) return validationError(res, err);
          });
        });
      }
      //return json array of all users in room
      return res.json(200, room.users);
    });
  });
};

// Deletes a rooms from the DB.
exports.destroy = function(req, res) {
  Rooms.findById(req.params.id, function (err, rooms) {
    if(err) { return handleError(res, err); }
    if(!rooms) { return res.send(404); }
    rooms.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}


/**
 * Function is called by socket.io listener to update room DB and user DB with user data
 * @param data
 * @param cb
 */
exports.updateRoom = function(data, cb) {
  var userId = data.user._id;
  var roomId = data.roomId;
  Rooms.findById(roomId, function (err, room) {
    if (err) { return handleError(res, err); }
    if(!room) { return res.send(404); }
    var updated;
    var preExistingUser = false;
    room.users.forEach(function(user, index) {
      if( user._id === userId ) {
        updated = _.merge(user, data.user);
        preExistingUser = true;
      }
    });
    if( !preExistingUser ) {
      updated = room.users.push(data.user);
    }
    room.save(function (err) {
      if (err) { return handleError(res, err); }
      else {
        User.findById(userId, function (err, user) {
          console.log('user is ', user);
          for( var i = 0, len = user.memberOfRooms.length; i < len ; i++ ) {
            if( user.memberOfRooms[i].roomId === roomId ) {
              return new Error('user already a member of this room');
            }
          }
          user.memberOfRooms.push({roomId: roomId, name: req.body.name});
          user.save(function(err) {
            if (err) return validationError(res, err);
          });
        });
      }
      //return json array of all users in room
      //return res.json(200, room.users);
      console.log('room.users is ', room.users);
      var usersObj = room.users.reduce(function(a, b) {
        a[b._id] = b;
        return a;
      }, {});
      cb(usersObj);
    });
  });
};


exports.getUsersForRoom = function(data, cb) {
  console.log('getUsersForRoom called rooms.controller');
  console.log('socket.io data is ', data);
  var userId = data.userId;
  var roomId = data.roomId;
  Rooms.findById(roomId, function (err, room) {
    if (err) { return handleError(res, err); }
    if(!room) { return res.send(404); }
    var usersObj = room.users.reduce(function(a, b) {
      a[b._id] = b;
      return a;
    }, {});
    cb(usersObj);
  });
};
