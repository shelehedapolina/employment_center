const pool = require('../config/db');

async function findActive({ minSalary }) {
  const params = [];
  let where = "WHERE v.status = 'Активна'";

  if (minSalary) {
    params.push(minSalary);
    where += ` AND v.salary_min >= $${params.length}`;
  }

  const { rows } = await pool.query(`
    SELECT v.*, e.company_name, e.industry, p.name AS profession_name
    FROM vacancies v
    JOIN employers   e ON v.employer_id   = e.employer_id
    JOIN professions p ON v.profession_id = p.profession_id
    ${where}
    ORDER BY v.posted_date DESC
  `, params);
  return rows;
}

async function create(data) {
  await pool.query(`
    INSERT INTO vacancies
      (employer_id, profession_id, title, description,
       salary_min, salary_max, work_schedule, experience_required, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  `, [
    data.employer_id, data.profession_id, data.title, data.description,
    data.salary_min, data.salary_max, data.work_schedule,
    data.experience_required || 0, data.status || 'Активна',
  ]);
}

async function remove(id) {
  await pool.query('DELETE FROM vacancies WHERE vacancy_id = $1', [id]);
}

async function findMatchesForSeeker(professionId, minSalary) {
  const { rows } = await pool.query(`
    SELECT v.*, e.company_name, e.industry, p.name AS profession_name,
           CASE
             WHEN v.profession_id = $1 THEN 100
             WHEN v.salary_max   >= $2 THEN 70
             ELSE 40
           END AS match_score
    FROM vacancies v
    JOIN employers   e ON v.employer_id   = e.employer_id
    JOIN professions p ON v.profession_id = p.profession_id
    WHERE v.status = 'Активна'
      AND (v.profession_id = $1 OR v.salary_max >= $2 * 0.8)
    ORDER BY match_score DESC, v.salary_max DESC
    LIMIT 15
  `, [professionId, minSalary]);
  return rows;
}

module.exports = {
  findActive,
  create,
  remove,
  findMatchesForSeeker,
};
