const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query(
    'SELECT * FROM employers ORDER BY company_name'
  );
  return rows;
}

async function findAllWithVacancyCounts() {
  const { rows } = await pool.query(`
    SELECT e.*,
      (SELECT COUNT(*) FROM vacancies v
       WHERE v.employer_id = e.employer_id AND v.status = 'Активна') AS active_vacancies
    FROM employers e
    ORDER BY e.company_name
  `);
  return rows;
}

module.exports = { findAll, findAllWithVacancyCounts };
