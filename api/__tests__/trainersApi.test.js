// Tests de integración de los endpoints /api/trainers (supertest)
const request = require('supertest');

describe('API /api/trainers', () => {
  let app;

  // resetModules + require fresco => cada test parte de la data inicial [Red, Blue]
  beforeEach(() => {
    jest.resetModules();
    app = require('../server');
  });

  test('GET /api/trainers devuelve la lista', async () => {
    const res = await request(app).get('/api/trainers');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: 'Red' },
      { id: 2, name: 'Blue' },
    ]);
  });

  test('GET /api/trainers/:id devuelve un entrenador', async () => {
    const res = await request(app).get('/api/trainers/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'Red' });
  });

  test('POST /api/trainers crea un entrenador con id autogenerado', async () => {
    const res = await request(app).post('/api/trainers').send({ name: 'Ash' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 3, name: 'Ash' });
  });

  test('POST /api/trainers sin nombre devuelve 400', async () => {
    const res = await request(app).post('/api/trainers').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /api/trainers/:id actualiza un entrenador', async () => {
    const res = await request(app).put('/api/trainers/1').send({ name: 'Red 2' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'Red 2' });
  });

  test('PUT /api/trainers/:id inexistente devuelve 404', async () => {
    const res = await request(app).put('/api/trainers/999').send({ name: 'Nadie' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/trainers/:id elimina un entrenador', async () => {
    const res = await request(app).delete('/api/trainers/2');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, name: 'Blue' });
  });

  test('DELETE /api/trainers/:id inexistente devuelve 404', async () => {
    const res = await request(app).delete('/api/trainers/999');
    expect(res.status).toBe(404);
  });
});
