const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query(`
    SELECT a.*,
           js.last_name || ' ' || js.first_name AS seeker_name,
           v.title AS vacancy_title,
           e.company_name
    FROM applications a
    JOIN job_seekers js ON a.seeker_id   = js.seeker_id
    JOIN vacancies   v  ON a.vacancy_id  = v.vacancy_id
    JOIN employers   e  ON v.employer_id = e.employer_id
    ORDER BY a.application_date DESC
  `);
  return rows;
}

async function findBySeeker(seekerId) {
  const { rows } = await pool.query(`
    SELECT a.*, v.title, e.company_name
    FROM applications a
    JOIN vacancies v ON a.vacancy_id  = v.vacancy_id
    JOIN employers e ON v.employer_id = e.employer_id
    WHERE a.seeker_id = $1
    ORDER BY a.application_date DESC
  `, [seekerId]);
  return rows;
}

async function updateStatus(id, status) {
  await pool.query(
    'UPDATE applications SET status = $1 WHERE application_id = $2',
    [status, id]
  );
}

module.exports = { findAll, findBySeeker, updateStatus };
