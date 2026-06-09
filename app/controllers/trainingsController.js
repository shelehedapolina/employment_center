const trainingsRepository = require('../repositories/trainingsRepository');

async function list(req, res) {
  const trainings = await trainingsRepository.findAllWithEnrollment();
  res.render('trainings', { trainings, active: 'trainings' });
}

async function enroll(req, res) {
  const { seeker_id, training_id } = req.body;
  await trainingsRepository.enroll(seeker_id, training_id);
  res.redirect(`/seekers/${seeker_id}`);
}

module.exports = { list, enroll };
