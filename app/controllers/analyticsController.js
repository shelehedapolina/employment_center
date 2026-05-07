const analyticsRepository = require('../repositories/analyticsRepository');

async function index(req, res) {
  const [topProfessions, consEff, statusDist, industryStats] = await Promise.all([
    analyticsRepository.topProfessions(),
    analyticsRepository.consultantEfficiency(),
    analyticsRepository.statusDistribution(),
    analyticsRepository.industryStats(),
  ]);

  res.render('analytics', {
    topProfessions,
    consEff,
    statusDist,
    industryStats,
    active: 'analytics',
  });
}

module.exports = { index };
