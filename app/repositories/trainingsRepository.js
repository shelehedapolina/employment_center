const pool = require('../config/db');

async function findAllWithEnrollment() {
  const { rows } = await pool.query(`
    SELECT t.*, p.name AS profession_name,
      (SELECT COUNT(*) FROM training_enrollments te
       WHERE te.training_id = t.training_id) AS enrolled
    FROM trainings t
    JOIN professions p ON t.profession_id = p.profession_id
    ORDER BY t.start_date DESC
  `);
  return rows;
}

module.exports = { findAllWithEnrollment };
