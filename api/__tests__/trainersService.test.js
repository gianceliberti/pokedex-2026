// Tests unitarios del service, con la conexión a la DB mockeada
// (no hace falta un Postgres corriendo para pasar estos tests).
jest.mock('../db/database', () => ({ query: jest.fn() }));

const pool = require('../db/database');
const service = require('../public/trainersService');

describe('trainersService (DB mockeada)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTrainers hace SELECT y devuelve las filas', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red' }, { id: 2, name: 'Blue' }] });

    const trainers = await service.getTrainers();

    expect(trainers).toEqual([{ id: 1, name: 'Red' }, { id: 2, name: 'Blue' }]);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM trainers ORDER BY id');
  });

  test('getTrainerById busca por id', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red' }] });

    const trainer = await service.getTrainerById(1);

    expect(trainer).toEqual({ id: 1, name: 'Red' });
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM trainers WHERE id = $1', [1]);
  });

  test('addTrainer inserta y devuelve el nuevo entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3, name: 'Ash' }] });

    const trainer = await service.addTrainer({ name: 'Ash' });

    expect(trainer).toEqual({ id: 3, name: 'Ash' });
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO trainers (name) VALUES ($1) RETURNING *',
      ['Ash']
    );
  });

  test('addTrainer lanza error si falta el nombre (sin tocar la DB)', async () => {
    await expect(service.addTrainer({})).rejects.toThrow('Name is required.');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('updateTrainer actualiza y devuelve el entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red Updated' }] });

    const updated = await service.updateTrainer(1, { name: 'Red Updated' });

    expect(updated).toEqual({ id: 1, name: 'Red Updated' });
  });

  test('updateTrainer devuelve null si no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await service.updateTrainer(999, { name: 'Nadie' })).toBeNull();
  });

  test('deleteTrainer elimina y devuelve el entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2, name: 'Blue' }] });
    expect(await service.deleteTrainer(2)).toEqual({ id: 2, name: 'Blue' });
  });

  test('deleteTrainer devuelve null si no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    expect(await service.deleteTrainer(999)).toBeNull();
  });
});
