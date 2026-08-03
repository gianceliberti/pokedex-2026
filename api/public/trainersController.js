const trainersService = require('./trainersService');

// Controladores para operaciones CRUD
exports.getTrainers = (req, res) => {
  const trainers = trainersService.getTrainers();
  res.json(trainers);
};

exports.getTrainerById = (req, res) => {
  const trainer = trainersService.getTrainerById(parseInt(req.params.id));
  res.json(trainer);
};

exports.addTrainer = (req, res) => {
  try {
    const { name, ...rest } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    // El id es opcional: si no viene, el service lo genera
    const trainer = trainersService.addTrainer({ name, ...rest });
    res.status(201).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


exports.updateTrainer = (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrainerData = req.body;

    const updatedTrainer = trainersService.updateTrainer(id, updatedTrainerData);

    if (!updatedTrainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    res.json(updatedTrainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteTrainer = (req, res) => {
  try {
    const { id } = req.params;

    const deletedTrainer = trainersService.deleteTrainer(id);

    if (!deletedTrainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    res.json(deletedTrainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};