const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'ec_admin',
  password: process.env.DB_PASSWORD || 'ec_pass',
  database: process.env.DB_NAME     || 'employment_center',
});

module.exports = pool;
