const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.get('/', async (req, res) => {
  const { search = '', status = '' } = req.query;
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

  try {
    const result = await pool.query(`
      SELECT js.*,
             p.name AS profession_name,
             c.last_name || ' ' || c.first_name AS consultant_name
      FROM job_seekers js
      LEFT JOIN professions p  ON js.profession_id  = p.profession_id
      LEFT JOIN consultants c  ON js.consultant_id  = c.consultant_id
      ${where}
      ORDER BY js.seeker_id
    `, params);

    res.render('seekers', { seekers: result.rows, search, status, active: 'seekers' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

router.get('/new', async (req, res) => {
  const [profs, cons] = await Promise.all([
    pool.query('SELECT * FROM professions ORDER BY name'),
    pool.query('SELECT * FROM consultants  ORDER BY last_name'),
  ]);
  res.render('seeker_form', {
    seeker: null,
    professions: profs.rows,
    consultants: cons.rows,
    active: 'seekers',
  });
});

router.post('/', async (req, res) => {
  const b = req.body;
  try {
    await pool.query(`
      INSERT INTO job_seekers
        (last_name, first_name, middle_name, birth_date, gender,
         passport_number, tax_id, phone, email, address,
         status, desired_salary, profession_id, consultant_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    `, [
      b.last_name, b.first_name, b.middle_name || null,
      b.birth_date, b.gender, b.passport_number, b.tax_id || null,
      b.phone, b.email || null, b.address,
      b.status || 'Шукає', b.desired_salary || null,
      b.profession_id, b.consultant_id || null,
    ]);
    res.redirect('/seekers');
  } catch (e) {
    res.status(400).send('Помилка: ' + e.message);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [seeker, edu, exp, apps] = await Promise.all([
      pool.query(`
        SELECT js.*, p.name AS profession_name,
               c.last_name || ' ' || c.first_name AS consultant_name
        FROM job_seekers js
        LEFT JOIN professions p ON js.profession_id = p.profession_id
        LEFT JOIN consultants c ON js.consultant_id = c.consultant_id
        WHERE seeker_id = $1
      `, [id]),
      pool.query('SELECT * FROM education WHERE seeker_id = $1', [id]),
      pool.query('SELECT * FROM work_experience WHERE seeker_id = $1 ORDER BY start_date DESC', [id]),
      pool.query(`
        SELECT a.*, v.title, e.company_name
        FROM applications a
        JOIN vacancies v ON a.vacancy_id  = v.vacancy_id
        JOIN employers e ON v.employer_id = e.employer_id
        WHERE a.seeker_id = $1
        ORDER BY a.application_date DESC
      `, [id]),
    ]);

    if (!seeker.rows.length) return res.status(404).send('Шукача не знайдено');

    res.render('seeker_detail', {
      s: seeker.rows[0],
      education:    edu.rows,
      experience:   exp.rows,
      applications: apps.rows,
      active: 'seekers',
    });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

router.post('/:id/delete', async (req, res) => {
  await pool.query('DELETE FROM job_seekers WHERE seeker_id = $1', [req.params.id]);
  res.redirect('/seekers');
});

module.exports = router;
