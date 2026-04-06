const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1')
  .then(() => console.log('✅ PostgreSQL подключён'))
  .catch(err => console.error('Ошибка подключения к БД:', err.message));

module.exports = pool;