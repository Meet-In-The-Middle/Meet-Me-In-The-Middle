'use strict';

var express = require('express');
var controller = require('./rooms.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/adduser', controller.joinRoomHTTP);
router.patch('/:id', controller.joinRoomHTTP);
router.delete('/:id', controller.destroy);

module.exports = router;
