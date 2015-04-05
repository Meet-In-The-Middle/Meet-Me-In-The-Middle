/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Gmaps = require('./gmaps.model');

exports.register = function(socket) {
  Gmaps.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Gmaps.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('gmaps:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('gmaps:remove', doc);
}