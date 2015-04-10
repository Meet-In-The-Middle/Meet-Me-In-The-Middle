/**
 * Broadcast updates to client when the model changes
 */

'use strict';
/*
var io = require('../app.js').io;

var Rooms = require('./rooms.model');

var RoomsCtrl = require('./rooms.controller');

var midUpCreate = io
  .of('/midupcreate')
  .on('connection', function(socket) {
    socket.emit('message', {
      that: 'only',
      '/midupcreate': 'will get'
    });
    midUpCreate.emit('a message', {
      everyone: 'in',
      '/midupcreate': 'will get'
    });
  });

var newsy = io
  .of('/newsy')
  .on('connection', function(socket) {
    socket.emit('news', {news: 'item'});
  });
*/





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
