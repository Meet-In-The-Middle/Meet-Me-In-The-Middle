/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rooms = require('./rooms.model');

exports.register = function(socket) {
  Rooms.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Rooms.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('rooms:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('rooms:remove', doc);
}