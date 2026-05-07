const pool = require('../config/db');

async function topProfessions() {
  const { rows } = await pool.query(`
    SELECT p.name, COUNT(v.vacancy_id) AS open_vacs,
           ROUND(AVG(v.salary_max), 0) AS avg_salary
    FROM professions p
    JOIN vacancies v ON p.profession_id = v.profession_id
    WHERE v.status = 'Активна'
    GROUP BY p.name
    ORDER BY open_vacs DESC
    LIMIT 10
  `);
  return rows;
}

async function consultantEfficiency() {
  const { rows } = await pool.query(`
    SELECT c.last_name || ' ' || c.first_name AS consultant,
           COUNT(DISTINCT js.seeker_id)   AS total_seekers,
           COUNT(DISTINCT pl.placement_id) AS placements,
           CASE WHEN COUNT(DISTINCT js.seeker_id) > 0
             THEN ROUND(100.0 * COUNT(DISTINCT pl.placement_id) / COUNT(DISTINCT js.seeker_id), 1)
             ELSE 0 END AS efficiency_pct
    FROM consultants c
    LEFT JOIN job_seekers  js ON js.consultant_id  = c.consultant_id
    LEFT JOIN applications a  ON a.seeker_id        = js.seeker_id
    LEFT JOIN placements   pl ON pl.application_id  = a.application_id
    GROUP BY c.last_name, c.first_name
    ORDER BY efficiency_pct DESC
  `);
  return rows;
}

async function statusDistribution() {
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS cnt
    FROM job_seekers
    GROUP BY status
    ORDER BY cnt DESC
  `);
  return rows;
}

async function industryStats() {
  const { rows } = await pool.query(`
    SELECT e.industry,
           COUNT(v.vacancy_id)        AS vacancies_count,
           ROUND(AVG(v.salary_min), 0) AS min_avg,
           ROUND(AVG(v.salary_max), 0) AS max_avg
    FROM employers e
    JOIN vacancies v ON e.employer_id = v.employer_id
    WHERE v.status = 'Активна'
    GROUP BY e.industry
    ORDER BY max_avg DESC
  `);
  return rows;
}

module.exports = {
  topProfessions,
  consultantEfficiency,
  statusDistribution,
  industryStats,
};
