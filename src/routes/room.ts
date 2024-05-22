const express = require('express');
const router = express.Router();

const RoomSocketController = require('../app/controllers/RoomController');

router.route('/')
    .get(RoomSocketController.getAllRecords)
    .post(RoomSocketController.userJoinToNewRoom);

router.route('/:userId')
    .get(RoomSocketController.getAllUserInRooms);

module.exports = router;

export {}