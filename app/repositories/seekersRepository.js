const pool = require('../config/db');

async function findAll({ search, status }) {
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (js.last_name ILIKE $${params.length} OR js.first_name ILIKE $${params.length})`;
  }
  if (status) {
    params.push(status);
    where += ` AND js.status = $${params.length}`;
  }

  const { rows } = await pool.query(`
    SELECT js.*,
           p.name AS profession_name,
           c.last_name || ' ' || c.first_name AS consultant_name
    FROM job_seekers js
    LEFT JOIN professions p ON js.profession_id = p.profession_id
    LEFT JOIN consultants c ON js.consultant_id = c.consultant_id
    ${where}
    ORDER BY js.seeker_id
  `, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`
    SELECT js.*, p.name AS profession_name,
           c.last_name || ' ' || c.first_name AS consultant_name
    FROM job_seekers js
    LEFT JOIN professions p ON js.profession_id = p.profession_id
    LEFT JOIN consultants c ON js.consultant_id = c.consultant_id
    WHERE seeker_id = $1
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  await pool.query(`
    INSERT INTO job_seekers
      (last_name, first_name, middle_name, birth_date, gender,
       passport_number, tax_id, phone, email, address,
       status, desired_salary, profession_id, consultant_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
  `, [
    data.last_name, data.first_name, data.middle_name || null,
    data.birth_date, data.gender, data.passport_number, data.tax_id || null,
    data.phone, data.email || null, data.address,
    data.status || 'Шукає', data.desired_salary || null,
    data.profession_id, data.consultant_id || null,
  ]);
}

async function remove(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM placements
       WHERE application_id IN (SELECT application_id FROM applications WHERE seeker_id = $1)`,
      [id]
    );
    await client.query('DELETE FROM applications WHERE seeker_id = $1', [id]);
    await client.query('DELETE FROM training_enrollments WHERE seeker_id = $1', [id]);
    await client.query('DELETE FROM job_seekers WHERE seeker_id = $1', [id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findEducation(seekerId) {
  const { rows } = await pool.query(
    'SELECT * FROM education WHERE seeker_id = $1',
    [seekerId]
  );
  return rows;
}

async function findWorkExperience(seekerId) {
  const { rows } = await pool.query(
    'SELECT * FROM work_experience WHERE seeker_id = $1 ORDER BY start_date DESC',
    [seekerId]
  );
  return rows;
}

module.exports = {
  findAll,
  findById,
  create,
  remove,
  findEducation,
  findWorkExperience,
};
