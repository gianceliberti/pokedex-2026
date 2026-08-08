const pool = require('../db/database');

// Lógica de negocio para operaciones CRUD (persistido en PostgreSQL)

exports.getTrainers = async () => {
  const result = await pool.query('SELECT * FROM trainers ORDER BY id');
  return result.rows;
};

exports.getTrainerById = async (id) => {
  const result = await pool.query('SELECT * FROM trainers WHERE id = $1', [id]);
  return result.rows[0];
};

exports.addTrainer = async ({ name }) => {
  if (!name) {
    throw new Error('Name is required.');
  }

  // El id lo genera Postgres (columna SERIAL)
  const result = await pool.query(
    'INSERT INTO trainers (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

exports.updateTrainer = async (id, { name }) => {
  const result = await pool.query(
    'UPDATE trainers SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0] || null;
};

exports.deleteTrainer = async (id) => {
  const result = await pool.query('DELETE FROM trainers WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};
