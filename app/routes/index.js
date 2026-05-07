const express = require('express');

const homeRoutes         = require('./home');
const seekersRoutes      = require('./seekers');
const vacanciesRoutes    = require('./vacancies');
const employersRoutes    = require('./employers');
const applicationsRoutes = require('./applications');
const trainingsRoutes    = require('./trainings');
const analyticsRoutes    = require('./analytics');
const matchRoutes        = require('./match');

const router = express.Router();

router.use('/seekers',      seekersRoutes);
router.use('/vacancies',    vacanciesRoutes);
router.use('/employers',    employersRoutes);
router.use('/applications', applicationsRoutes);
router.use('/trainings',    trainingsRoutes);
router.use('/analytics',    analyticsRoutes);
router.use('/match',        matchRoutes);
router.use('/',             homeRoutes);

module.exports = router;
