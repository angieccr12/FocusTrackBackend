// __tests__/activityRoutes.test.js

// 👇 MOCKS VAN PRIMERO 👇

// Mockear middleware de autenticación
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1 }; // Simula un usuario autenticado
  next();
});

// Mockear la base de datos
jest.mock('../../db', () => ({
  query: jest.fn()
}));

// 👇 Luego importamos lo demás
const request = require('supertest');
const app = require('../../app'); // Usa app después de mockear
const pool = require('../../db');

describe('POST /api/activity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería rechazar si los datos no son válidos', async () => {
    const res = await request(app)
      .post('/api/activity')
      .send({}); // faltan campos

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('debería insertar actividad si la app existe', async () => {
    pool.query
      .mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ appId: 1 }] }) // app ya existe
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [
            {
              appId: 1,
              deviceId: 123,
              recordDate: '2023-08-01',
              startTime: '10:00',
              endTime: '11:00'
            }
          ]
        })
      );

    const res = await request(app).post('/api/activity').send({
      deviceId: 123,
      appName: 'YouTube',
      recordDate: '2023-08-01',
      startTime: '10:00',
      endTime: '11:00'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('appId', 1);
  });

  it('debería insertar actividad y nueva app si no existe', async () => {
    pool.query
      .mockImplementationOnce(() => Promise.resolve({ rows: [] })) // app no existe
      .mockImplementationOnce(() => Promise.resolve({ rows: [{ appId: 2 }] })) // se crea nueva app
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [
            {
              appId: 2,
              deviceId: 456,
              recordDate: '2023-08-02',
              startTime: '12:00',
              endTime: '13:00'
            }
          ]
        })
      );

    const res = await request(app).post('/api/activity').send({
      deviceId: 456,
      appName: 'Slack',
      recordDate: '2023-08-02',
      startTime: '12:00',
      endTime: '13:00'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('appId', 2);
  });

  it('debería manejar errores del servidor', async () => {
    pool.query.mockImplementation(() => {
      throw new Error('DB failure');
    });

    const res = await request(app).post('/api/activity').send({
      deviceId: 789,
      appName: 'Zoom',
      recordDate: '2023-08-03',
      startTime: '14:00',
      endTime: '15:00'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error registering activity');
  });
});
