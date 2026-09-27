const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'vision_without_limits',
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err);
});

module.exports = pool;
