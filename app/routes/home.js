const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/homeController');

const router = express.Router();

router.get('/', asyncHandler(controller.index));

module.exports = router;
