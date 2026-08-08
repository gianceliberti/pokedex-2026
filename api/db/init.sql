-- Se ejecuta automáticamente la primera vez que se crea el contenedor de Postgres
-- (docker-entrypoint-initdb.d). Crea la tabla de entrenadores y siembra los iniciales.

CREATE TABLE IF NOT EXISTS trainers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO trainers (name) VALUES ('Red'), ('Blue');
