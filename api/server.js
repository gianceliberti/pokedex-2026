//servidor de la API
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Permitir peticiones desde el frontend (corre en otro puerto)
app.use(cors());
// Configurar middleware para manejar datos JSON
app.use(express.json());

// Configurar rutas de la API
const trainersRouter = require('./public/trainersRouter');
app.use('/api/trainers', trainersRouter);

// Servidor escuchando en el puerto
app.listen(port, () => {
  console.log(`Servidor de la API en http://localhost:${port}`);
});
