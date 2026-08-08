// Tests unitarios de la lógica de negocio (trainersService)

describe('trainersService', () => {
  let service;

  // resetModules + require fresco => cada test parte de la data inicial [Red, Blue]
  beforeEach(() => {
    jest.resetModules();
    service = require('../public/trainersService');
  });

  test('getTrainers devuelve la lista inicial', () => {
    expect(service.getTrainers()).toEqual([
      { id: 1, name: 'Red' },
      { id: 2, name: 'Blue' },
    ]);
  });

  test('getTrainerById encuentra un entrenador por id', () => {
    expect(service.getTrainerById(1)).toEqual({ id: 1, name: 'Red' });
  });

  test('getTrainerById devuelve undefined si no existe', () => {
    expect(service.getTrainerById(999)).toBeUndefined();
  });

  test('addTrainer genera el id automáticamente (max + 1)', () => {
    const trainer = service.addTrainer({ name: 'Ash' });
    expect(trainer).toEqual({ id: 3, name: 'Ash' });
    expect(service.getTrainers()).toHaveLength(3);
  });

  test('addTrainer respeta un id explícito si se pasa', () => {
    const trainer = service.addTrainer({ id: 50, name: 'Gary' });
    expect(trainer.id).toBe(50);
  });

  test('addTrainer lanza error si falta el nombre', () => {
    expect(() => service.addTrainer({})).toThrow('Name is required.');
  });

  test('updateTrainer actualiza un entrenador existente', () => {
    const updated = service.updateTrainer(1, { name: 'Red Updated' });
    expect(updated).toEqual({ id: 1, name: 'Red Updated' });
  });

  test('updateTrainer devuelve null si el entrenador no existe', () => {
    expect(service.updateTrainer(999, { name: 'Nadie' })).toBeNull();
  });

  test('deleteTrainer elimina y devuelve el entrenador', () => {
    const deleted = service.deleteTrainer(2);
    expect(deleted).toEqual({ id: 2, name: 'Blue' });
    expect(service.getTrainers()).toHaveLength(1);
  });

  test('deleteTrainer devuelve null si el entrenador no existe', () => {
    expect(service.deleteTrainer(999)).toBeNull();
  });
});
