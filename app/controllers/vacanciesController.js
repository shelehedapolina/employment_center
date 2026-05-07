const vacanciesRepository = require('../repositories/vacanciesRepository');
const employersRepository = require('../repositories/employersRepository');
const professionsRepository = require('../repositories/professionsRepository');

async function list(req, res) {
  const { minSalary = '' } = req.query;
  const vacancies = await vacanciesRepository.findActive({ minSalary });
  res.render('vacancies', { vacancies, minSalary, active: 'vacancies' });
}

async function newForm(req, res) {
  const [employers, professions] = await Promise.all([
    employersRepository.findAll(),
    professionsRepository.findAll(),
  ]);
  res.render('vacancy_form', {
    employers,
    professions,
    active: 'vacancies',
  });
}

async function create(req, res) {
  await vacanciesRepository.create(req.body);
  res.redirect('/vacancies');
}

async function remove(req, res) {
  await vacanciesRepository.remove(req.params.id);
  res.redirect('/vacancies');
}

module.exports = { list, newForm, create, remove };
