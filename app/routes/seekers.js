const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/seekersController');

const router = express.Router();

router.get('/',           asyncHandler(controller.list));
router.get('/new',        asyncHandler(controller.newForm));
router.post('/',          asyncHandler(controller.create));
router.get('/:id',        asyncHandler(controller.detail));
router.post('/:id/delete', asyncHandler(controller.remove));

module.exports = router;
