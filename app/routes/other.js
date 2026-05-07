const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// ── Роботодавці ────────────────────────────────────────────────────────────
router.get('/employers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM vacancies v
         WHERE v.employer_id = e.employer_id AND v.status = 'Активна') AS active_vacancies
      FROM employers e
      ORDER BY e.company_name
    `);
    res.render('employers', { employers: result.rows, active: 'employers' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

// ── Заявки ─────────────────────────────────────────────────────────────────
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*,
             js.last_name || ' ' || js.first_name AS seeker_name,
             v.title AS vacancy_title,
             e.company_name
      FROM applications a
      JOIN job_seekers js ON a.seeker_id  = js.seeker_id
      JOIN vacancies   v  ON a.vacancy_id  = v.vacancy_id
      JOIN employers   e  ON v.employer_id = e.employer_id
      ORDER BY a.application_date DESC
    `);
    res.render('applications', { applications: result.rows, active: 'applications' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

router.post('/applications/:id/status', async (req, res) => {
  await pool.query(
    'UPDATE applications SET status = $1 WHERE application_id = $2',
    [req.body.status, req.params.id]
  );
  res.redirect('/applications');
});

// ── Навчання ───────────────────────────────────────────────────────────────
router.get('/trainings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name AS profession_name,
        (SELECT COUNT(*) FROM training_enrollments te
         WHERE te.training_id = t.training_id) AS enrolled
      FROM trainings t
      JOIN professions p ON t.profession_id = p.profession_id
      ORDER BY t.start_date DESC
    `);
    res.render('trainings', { trainings: result.rows, active: 'trainings' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

// ── Аналітика ──────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [topProfessions, consEff, statusDist, industryStats] = await Promise.all([
      pool.query(`
        SELECT p.name, COUNT(v.vacancy_id) AS open_vacs,
               ROUND(AVG(v.salary_max), 0) AS avg_salary
        FROM professions p
        JOIN vacancies v ON p.profession_id = v.profession_id
        WHERE v.status = 'Активна'
        GROUP BY p.name
        ORDER BY open_vacs DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT c.last_name || ' ' || c.first_name AS consultant,
               COUNT(DISTINCT js.seeker_id)  AS total_seekers,
               COUNT(DISTINCT pl.placement_id) AS placements,
               CASE WHEN COUNT(DISTINCT js.seeker_id) > 0
                 THEN ROUND(100.0 * COUNT(DISTINCT pl.placement_id) / COUNT(DISTINCT js.seeker_id), 1)
                 ELSE 0 END AS efficiency_pct
        FROM consultants c
        LEFT JOIN job_seekers js ON js.consultant_id  = c.consultant_id
        LEFT JOIN applications a ON a.seeker_id       = js.seeker_id
        LEFT JOIN placements   pl ON pl.application_id = a.application_id
        GROUP BY c.last_name, c.first_name
        ORDER BY efficiency_pct DESC
      `),
      pool.query(`
        SELECT status, COUNT(*) AS cnt
        FROM job_seekers
        GROUP BY status
        ORDER BY cnt DESC
      `),
      pool.query(`
        SELECT e.industry,
               COUNT(v.vacancy_id)       AS vacancies_count,
               ROUND(AVG(v.salary_min), 0) AS min_avg,
               ROUND(AVG(v.salary_max), 0) AS max_avg
        FROM employers e
        JOIN vacancies v ON e.employer_id = v.employer_id
        WHERE v.status = 'Активна'
        GROUP BY e.industry
        ORDER BY max_avg DESC
      `),
    ]);

    res.render('analytics', {
      topProfessions: topProfessions.rows,
      consEff:        consEff.rows,
      statusDist:     statusDist.rows,
      industryStats:  industryStats.rows,
      active: 'analytics',
    });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

// ── Smart matching ─────────────────────────────────────────────────────────
router.get('/match/:seekerId', async (req, res) => {
  const { seekerId } = req.params;
  try {
    const seekerResult = await pool.query(
      'SELECT * FROM job_seekers WHERE seeker_id = $1', [seekerId]
    );
    if (!seekerResult.rows.length) return res.status(404).send('Шукача не знайдено');

    const seeker = seekerResult.rows[0];
    const minSalary = seeker.desired_salary || 15000;

    const matches = await pool.query(`
      SELECT v.*, e.company_name, e.industry, p.name AS profession_name,
             CASE
               WHEN v.profession_id = $1 THEN 100
               WHEN v.salary_max >= $2   THEN 70
               ELSE 40
             END AS match_score
      FROM vacancies v
      JOIN employers  e ON v.employer_id  = e.employer_id
      JOIN professions p ON v.profession_id = p.profession_id
      WHERE v.status = 'Активна'
        AND (v.profession_id = $1 OR v.salary_max >= $2 * 0.8)
      ORDER BY match_score DESC, v.salary_max DESC
      LIMIT 15
    `, [seeker.profession_id, minSalary]);

    res.render('matches', { seeker, matches: matches.rows });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

module.exports = router;
