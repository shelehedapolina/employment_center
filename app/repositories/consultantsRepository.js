const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM consultants ORDER BY last_name');
  return rows;
}

module.exports = { findAll };
