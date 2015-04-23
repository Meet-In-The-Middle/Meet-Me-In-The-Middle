'use strict';

var express = require('express');
var controller = require('./rooms.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
<<<<<<< HEAD
router.post('/', controller.create);
=======
router.post('/', controller.createRoom);
>>>>>>> (fix) fix websocket errors on refresh (in deployed version) and refresh not loading marker data properly.
router.post('/adduser', controller.joinRoomHTTP);
router.patch('/:id', controller.joinRoomHTTP);
router.delete('/:id', controller.destroy);

module.exports = router;
