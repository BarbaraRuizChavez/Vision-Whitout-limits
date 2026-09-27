const { Pool } = require('pg');
require('dotenv').config();

// Pool único de conexiones reutilizado en toda la API.
// PGSSLMODE=require activa SSL — lo necesitas para bases en la nube como
// Neon o Supabase. Déjalo vacío para tu PostgreSQL local (no lo necesita).
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'vision_without_limits',
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err);
});

module.exports = pool;