'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Locations = new Schema({
  id: String,
  name : String,
  votes : Number,
  voters : [],
  marker : String,
  locInfo: []
})

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
  messages: [],
  locations: [Locations],
  createdAt: { type: Date, default: Date.now }
});

exports.Rooms = mongoose.model('Rooms', RoomsSchema);
exports.RoomUser = mongoose.model('RoomUser', RoomUserShema);

