const { Pool } = require('pg');
require('dotenv').config();

// Conexión a PostgreSQL. Los valores por defecto coinciden con docker-compose.yml,
// así que funciona out-of-the-box; se pueden sobrescribir con un archivo .env.
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pokemon',
});

module.exports = pool;
