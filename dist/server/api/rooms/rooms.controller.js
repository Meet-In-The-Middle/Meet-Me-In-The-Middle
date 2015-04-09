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

// Get a single rooms
exports.show = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(!err ) {
      var rooms = user.memberOfRooms;
      res.send(200, rooms);
    } else {
      res.send('error');
    }
  });

/*  Rooms.findById(req.params.id, function (err, rooms) {
    if(err) { return handleError(res, err); }
    if(!rooms) { return res.send(404); }
    return res.json(rooms);
  });*/
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

/*name: String,
  users: [],
  info: String,
  active: Boolean*/

/*userObj = {
 _id
 latitude:
 longitude:
 }


 { vb8Jqogd53BTaBDMAAAB:
 { id: 0,
 coords: { latitude: 52.2058804, longitude: 0.1453831999999693 }
 },
 ZGNL1pdiqsFMjG3DAAAC:
 { id: 0,
 coords: { latitude: 32.22414, longitude: -80.69725900000003 } } }*/


// Updates an existing rooms in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Rooms.findById(req.params.id, function (err, rooms) {
    if (err) { return handleError(res, err); }
    if(!rooms) { return res.send(404); }
    var updated = _.merge(rooms, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, rooms);
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
