const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/matchController');

const router = express.Router();

router.get('/:seekerId', asyncHandler(controller.show));

module.exports = router;
