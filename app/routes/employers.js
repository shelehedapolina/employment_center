const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/employersController');

const router = express.Router();

router.get('/', asyncHandler(controller.list));

module.exports = router;
