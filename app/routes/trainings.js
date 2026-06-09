const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/trainingsController');

const router = express.Router();

router.get('/',        asyncHandler(controller.list));
router.post('/enroll', asyncHandler(controller.enroll));

module.exports = router;
