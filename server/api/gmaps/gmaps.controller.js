'use strict';

var _ = require('lodash');
var Rooms = require('./gmaps.model');

// Get list of Rooms
exports.index = function(req, res) {
  Rooms.find(function (err, gmapss) {
    if(err) { return handleError(res, err); }
    return res.json(200, gmapss);
  });
};

// Get a single Room
exports.show = function(req, res) {
  Rooms.findById(req.params.id, function (err, gmaps) {
    if(err) { return handleError(res, err); }
    if(!gmaps) { return res.send(404); }
    return res.json(gmaps);
  });
};

// Creates a new Room in the DB.
exports.create = function(req, res) {
  Rooms.create(req.body, function(err, gmaps) {
    if(err) { return handleError(res, err); }
    return res.json(201, gmaps);
  });
};

// Updates an existing Room in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Rooms.findById(req.params.id, function (err, gmaps) {
    if (err) { return handleError(res, err); }
    if(!gmaps) { return res.send(404); }
    var updated = _.merge(gmaps, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, gmaps);
    });
  });
};

// Deletes a Room from the DB.
exports.destroy = function(req, res) {
  Rooms.findById(req.params.id, function (err, gmaps) {
    if(err) { return handleError(res, err); }
    if(!gmaps) { return res.send(404); }
    gmaps.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
