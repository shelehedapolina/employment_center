const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Define it in your environment (e.g. postgres://user:pass@host:5432/dbname).');
}

const LOCAL_HOSTS = /@(localhost|127\.0\.0\.1|db|postgres)(:|\/)/i;
const isRemote = !LOCAL_HOSTS.test(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
