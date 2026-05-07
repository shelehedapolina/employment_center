const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM professions ORDER BY name');
  return rows;
}

module.exports = { findAll };
