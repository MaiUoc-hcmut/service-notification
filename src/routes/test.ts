const express = require('express');
const router = express.Router();

const TestController = require('../app/controllers/test');

router.route('/')
    .get(TestController.testSocketIo);

module.exports = router;