const trainersService = require('./trainersService');

// Controladores para operaciones CRUD

exports.getTrainers = async (req, res) => {
  try {
    const trainers = await trainersService.getTrainers();
    res.json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await trainersService.getTrainerById(parseInt(req.params.id));
    res.json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.addTrainer = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const trainer = await trainersService.addTrainer({ name });
    res.status(201).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrainer = await trainersService.updateTrainer(id, req.body);

    if (!updatedTrainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    res.json(updatedTrainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTrainer = await trainersService.deleteTrainer(id);

    if (!deletedTrainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    res.json(deletedTrainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
