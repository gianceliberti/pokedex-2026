// Tests de integración de los endpoints, con la DB mockeada
// (verifican rutas + controlador + códigos de estado, sin un Postgres real).
jest.mock('../db/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../db/database');
const app = require('../server');

describe('API /api/trainers (DB mockeada)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/trainers devuelve la lista', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red' }, { id: 2, name: 'Blue' }] });

    const res = await request(app).get('/api/trainers');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'Red' }, { id: 2, name: 'Blue' }]);
  });

  test('GET /api/trainers/:id devuelve un entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red' }] });

    const res = await request(app).get('/api/trainers/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'Red' });
  });

  test('POST /api/trainers crea un entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3, name: 'Ash' }] });

    const res = await request(app).post('/api/trainers').send({ name: 'Ash' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 3, name: 'Ash' });
  });

  test('POST /api/trainers sin nombre devuelve 400 (sin tocar la DB)', async () => {
    const res = await request(app).post('/api/trainers').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT /api/trainers/:id actualiza un entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Red 2' }] });

    const res = await request(app).put('/api/trainers/1').send({ name: 'Red 2' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'Red 2' });
  });

  test('PUT /api/trainers/:id inexistente devuelve 404', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).put('/api/trainers/999').send({ name: 'Nadie' });

    expect(res.status).toBe(404);
  });

  test('DELETE /api/trainers/:id elimina un entrenador', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2, name: 'Blue' }] });

    const res = await request(app).delete('/api/trainers/2');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, name: 'Blue' });
  });

  test('DELETE /api/trainers/:id inexistente devuelve 404', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).delete('/api/trainers/999');

    expect(res.status).toBe(404);
  });
});
