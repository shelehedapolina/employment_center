const applicationsRepository = require('../repositories/applicationsRepository');

async function list(req, res) {
  const applications = await applicationsRepository.findAll();
  res.render('applications', { applications, active: 'applications' });
}

async function create(req, res) {
  const { seeker_id, vacancy_id } = req.body;
  await applicationsRepository.create(seeker_id, vacancy_id);
  res.redirect('/applications');
}

async function updateStatus(req, res) {
  await applicationsRepository.updateStatus(req.params.id, req.body.status);
  res.redirect('/applications');
}

module.exports = { list, create, updateStatus };
