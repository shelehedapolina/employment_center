const trainingsRepository = require('../repositories/trainingsRepository');

async function list(req, res) {
  const trainings = await trainingsRepository.findAllWithEnrollment();
  res.render('trainings', { trainings, active: 'trainings' });
}

module.exports = { list };
