const seekersRepository = require('../repositories/seekersRepository');
const applicationsRepository = require('../repositories/applicationsRepository');
const professionsRepository = require('../repositories/professionsRepository');
const consultantsRepository = require('../repositories/consultantsRepository');
const trainingsRepository = require('../repositories/trainingsRepository');

async function list(req, res) {
  const { search = '', status = '' } = req.query;
  const seekers = await seekersRepository.findAll({ search, status });
  res.render('seekers', { seekers, search, status, active: 'seekers' });
}

async function newForm(req, res) {
  const [professions, consultants] = await Promise.all([
    professionsRepository.findAll(),
    consultantsRepository.findAll(),
  ]);
  res.render('seeker_form', {
    seeker: null,
    professions,
    consultants,
    active: 'seekers',
  });
}

async function create(req, res) {
  await seekersRepository.create(req.body);
  res.redirect('/seekers');
}

async function detail(req, res) {
  const { id } = req.params;
  const [seeker, education, experience, applications, enrollments, trainings] = await Promise.all([
    seekersRepository.findById(id),
    seekersRepository.findEducation(id),
    seekersRepository.findWorkExperience(id),
    applicationsRepository.findBySeeker(id),
    trainingsRepository.findBySeeker(id),
    trainingsRepository.findAll(),
  ]);

  if (!seeker) return res.status(404).send('Шукача не знайдено');

  res.render('seeker_detail', {
    s: seeker,
    education,
    experience,
    applications,
    enrollments,
    trainings,
    active: 'seekers',
  });
}

async function remove(req, res) {
  await seekersRepository.remove(req.params.id);
  res.redirect('/seekers');
}

module.exports = { list, newForm, create, detail, remove };
