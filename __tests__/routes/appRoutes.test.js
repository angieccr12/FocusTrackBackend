// __tests__/appRoutes.test.js

// 👇 Mockear middleware y db ANTES que app
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1 }; // Simula un usuario autenticado
  next();
});

jest.mock('../../db', () => ({
  query: jest.fn()
}));

// 👇 Después de mockear, importar app y pool
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db');

describe('POST /api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería rechazar si no se proporciona appName', async () => {
    const res = await request(app).post('/api/apps').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre de la aplicación es requerido');
  });

  it('debería rechazar si la app ya existe', async () => {
    pool.query.mockImplementationOnce(() =>
      Promise.resolve({ rows: [{ appId: 1, appName: 'YouTube' }] })
    );

    const res = await request(app).post('/api/apps').send({ appName: 'YouTube' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('La aplicación ya está registrada');
  });

  it('debería insertar una app si no existe', async () => {
    pool.query
      .mockImplementationOnce(() => Promise.resolve({ rows: [] })) // No existe app
      .mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ appId: 2, appName: 'Slack' }] }) // Se inserta app
      );

    const res = await request(app).post('/api/apps').send({ appName: 'Slack' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('appId', 2);
  });

  it('debería manejar errores del servidor (POST)', async () => {
    pool.query.mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).post('/api/apps').send({ appName: 'Zoom' });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al registrar la aplicación');
  });
});

describe('GET /api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería devolver todas las apps', async () => {
    const mockApps = [
      { appId: 1, appName: 'YouTube' },
      { appId: 2, appName: 'Slack' }
    ];

    pool.query.mockImplementationOnce(() => Promise.resolve({ rows: mockApps }));

    const res = await request(app).get('/api/apps');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('appName', 'YouTube');
  });

  it('debería manejar errores del servidor (GET)', async () => {
    pool.query.mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/apps');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error del servidor al obtener apps');
  });
});
