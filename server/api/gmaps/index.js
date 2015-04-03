'use strict';

var express = require('express');
var controller = require('./gmaps.controller');
//added this to parse JSON data
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', jsonParser, controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
