const statsRepository = require('../repositories/statsRepository');

async function index(req, res) {
  const stats = await statsRepository.homeStats();
  res.render('index', { stats, active: 'home' });
}

module.exports = { index };
