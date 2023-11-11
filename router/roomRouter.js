const express = require('express');
const roomController = require('./../controller/roomController');

router = express.Router();

router.route('/').post(roomController.createRoom).get(roomController.getAllRooms).patch(roomController.addUserToRoom);

module.exports = router;