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

async function findAll() {
  const { rows } = await pool.query(`
    SELECT t.training_id, t.name, t.start_date, t.end_date, t.max_students,
      (SELECT COUNT(*) FROM training_enrollments te
       WHERE te.training_id = t.training_id) AS enrolled
    FROM trainings t
    ORDER BY t.start_date DESC
  `);
  return rows;
}

async function findBySeeker(seekerId) {
  const { rows } = await pool.query(`
    SELECT te.*, t.name, t.start_date, t.end_date, t.duration_hours
    FROM training_enrollments te
    JOIN trainings t ON te.training_id = t.training_id
    WHERE te.seeker_id = $1
    ORDER BY t.start_date DESC
  `, [seekerId]);
  return rows;
}

async function enroll(seekerId, trainingId) {
  await pool.query(`
    INSERT INTO training_enrollments (seeker_id, training_id)
    SELECT $1, $2
    FROM trainings t
    WHERE t.training_id = $2
      AND (SELECT COUNT(*) FROM training_enrollments te
           WHERE te.training_id = $2) < t.max_students
    ON CONFLICT (seeker_id, training_id) DO NOTHING
  `, [seekerId, trainingId]);
}

module.exports = { findAllWithEnrollment, findAll, findBySeeker, enroll };
