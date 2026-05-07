const employersRepository = require('../repositories/employersRepository');

async function list(req, res) {
  const employers = await employersRepository.findAllWithVacancyCounts();
  res.render('employers', { employers, active: 'employers' });
}

module.exports = { list };
