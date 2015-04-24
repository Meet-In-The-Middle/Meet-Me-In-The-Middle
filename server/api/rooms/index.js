'use strict';

var express = require('express');
var controller = require('./rooms.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.createRoom);
router.delete('/:id', controller.destroy);

module.exports = router;
