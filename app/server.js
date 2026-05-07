require('dotenv').config();

const express = require('express');
const path    = require('path');
const pool    = require('./config/db');

const seekersRouter   = require('./routes/seekers');
const vacanciesRouter = require('./routes/vacancies');
const otherRouter     = require('./routes/other');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Налаштування шаблонів ──────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Головна сторінка ───────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM job_seekers  WHERE status = 'Шукає')       AS active_seekers,
        (SELECT COUNT(*) FROM vacancies    WHERE status = 'Активна')      AS open_vacancies,
        (SELECT COUNT(*) FROM employers)                                   AS employers_count,
        (SELECT COUNT(*) FROM placements)                                  AS placements_count,
        (SELECT COUNT(*) FROM trainings)                                   AS trainings_count,
        (SELECT COUNT(*) FROM applications WHERE status = 'На розгляді') AS pending_apps
    `);
    res.render('index', { stats: result.rows[0], active: 'home' });
  } catch (e) {
    res.status(500).send('Помилка: ' + e.message);
  }
});

// ── Роутери ────────────────────────────────────────────────────────────────
app.use('/seekers',   seekersRouter);
app.use('/vacancies', vacanciesRouter);
app.use('/',          otherRouter);

// ── Запуск ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
