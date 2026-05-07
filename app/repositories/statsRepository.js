const pool = require('../config/db');

async function homeStats() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM job_seekers  WHERE status = 'Шукає')        AS active_seekers,
      (SELECT COUNT(*) FROM vacancies    WHERE status = 'Активна')      AS open_vacancies,
      (SELECT COUNT(*) FROM employers)                                  AS employers_count,
      (SELECT COUNT(*) FROM placements)                                 AS placements_count,
      (SELECT COUNT(*) FROM trainings)                                  AS trainings_count,
      (SELECT COUNT(*) FROM applications WHERE status = 'На розгляді')  AS pending_apps
  `);
  return rows[0];
}

module.exports = { homeStats };
