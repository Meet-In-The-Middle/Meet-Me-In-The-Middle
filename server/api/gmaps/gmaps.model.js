'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomsSchema = new Schema({
  name: String,
  users: [],
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Rooms', RoomsSchema);





