'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

<<<<<<< HEAD
var Locations = new Schema({
  id: String,
  name : String,
  votes : Number,
  voters : [],
  marker : String,
  locInfo: []
})

var RoomsSchema = new Schema({
  name: String,
  users: [],
  info: String,
  active: Boolean,
  messages: [],
  locations: [Locations],
});


module.exports = mongoose.model('Rooms', RoomsSchema);
=======
var RoomUserShema = new Schema({
  owner: Boolean,
  coords: {},
  name: String,
  userId: String,
  imageUrl: String
});

var RoomsSchema = new Schema({
  name: String,
  users: [RoomUserShema],
  info: String,
  active: Boolean,
  messages: []
});

//var RoomsSchema = new Schema({
//  name: String,
//  users: [],
//  info: String,
//  active: Boolean,
//  messages: []
//});
//module.exports = mongoose.model('Rooms', RoomsSchema);

exports.Rooms = mongoose.model('Rooms', RoomsSchema);
exports.RoomUser = mongoose.model('RoomUser', RoomUserShema);
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.

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
