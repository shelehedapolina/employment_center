const matchService = require('../services/matchService');

async function show(req, res) {
  const result = await matchService.findMatchesForSeeker(req.params.seekerId);
  if (!result) return res.status(404).send('Шукача не знайдено');
  res.render('matches', result);
}

module.exports = { show };
