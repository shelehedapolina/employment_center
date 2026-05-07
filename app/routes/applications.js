const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/applicationsController');

const router = express.Router();

router.get('/',             asyncHandler(controller.list));
router.post('/:id/status',  asyncHandler(controller.updateStatus));

module.exports = router;
