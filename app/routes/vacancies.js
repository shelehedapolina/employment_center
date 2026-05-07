const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// Список активних вакансій
router.get('/', async (req, res) => {
  const { minSalary = '' } = req.query;
  const params = [];
  let where = "WHERE v.status = 'Активна'";

  if (minSalary) {
    params.push(minSalary);
    where += ` AND v.salary_min >= $${params.length}`;
  }

  try {
    const result = await pool.query(`
      SELECT v.*, e.company_name, e.industry, p.name AS profession_name
      FROM vacancies v
      JOIN employers  e ON v.employer_id  = e.employer_id
      JOIN professions p ON v.profession_id = p.profession_id
      ${where}
      ORDER BY v.posted_date DESC
    `, params);

    res.render('vacancies', { vacancies: result.rows, minSalary, active: 'vacancies' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

// Форма нової вакансії
router.get('/new', async (req, res) => {
  const [emps, profs] = await Promise.all([
    pool.query('SELECT * FROM employers   ORDER BY company_name'),
    pool.query('SELECT * FROM professions ORDER BY name'),
  ]);
  res.render('vacancy_form', {
    employers:   emps.rows,
    professions: profs.rows,
    active: 'vacancies',
  });
});

// Збереження нової вакансії
router.post('/', async (req, res) => {
  const b = req.body;
  try {
    await pool.query(`
      INSERT INTO vacancies
        (employer_id, profession_id, title, description,
         salary_min, salary_max, work_schedule, experience_required, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, [
      b.employer_id, b.profession_id, b.title, b.description,
      b.salary_min, b.salary_max, b.work_schedule,
      b.experience_required || 0, b.status || 'Активна',
    ]);
    res.redirect('/vacancies');
  } catch (e) {
    res.status(400).send('Помилка: ' + e.message);
  }
});

// Видалення вакансії
router.post('/:id/delete', async (req, res) => {
  await pool.query('DELETE FROM vacancies WHERE vacancy_id = $1', [req.params.id]);
  res.redirect('/vacancies');
});

module.exports = router;
