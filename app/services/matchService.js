const seekersRepository = require('../repositories/seekersRepository');
const vacanciesRepository = require('../repositories/vacanciesRepository');

const FALLBACK_MIN_SALARY = 15000;

async function findMatchesForSeeker(seekerId) {
  const seeker = await seekersRepository.findById(seekerId);
  if (!seeker) return null;

  const minSalary = seeker.desired_salary || FALLBACK_MIN_SALARY;
  const matches = await vacanciesRepository.findMatchesForSeeker(
    seeker.profession_id,
    minSalary
  );

  return { seeker, matches };
}

module.exports = { findMatchesForSeeker };
