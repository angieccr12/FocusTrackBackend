// __tests__/deviceRoutes.test.js

// ✅ Mockear primero
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 42 }; // Usuario simulado autenticado
  next();
});

jest.mock('../../db', () => ({
  query: jest.fn()
}));

// 👇 Luego importar el resto
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db');

describe('POST /api/devices', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debería rechazar si falta deviceName o deviceType', async () => {
    const res = await request(app).post('/api/devices').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('debería registrar un dispositivo correctamente', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        deviceId: 1,
        userId: 42,
        deviceName: 'Laptop',
        deviceType: 'Windows'
      }]
    });

    const res = await request(app).post('/api/devices').send({
      deviceName: 'Laptop',
      deviceType: 'Windows'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Device registered successfully');
    expect(res.body.device).toHaveProperty('deviceName', 'Laptop');
  });

  it('debería manejar errores del servidor (POST)', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/devices').send({
      deviceName: 'Phone',
      deviceType: 'Android'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error while registering device');
  });
});

describe('GET /api/devices', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debería retornar los dispositivos del usuario', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { deviceId: 1, deviceName: 'Phone', deviceType: 'Android', userId: 42 },
        { deviceId: 2, deviceName: 'Laptop', deviceType: 'Windows', userId: 42 }
      ]
    });

    const res = await request(app).get('/api/devices');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('deviceName');
  });

  it('debería manejar errores del servidor (GET)', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/devices');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error while retrieving devices');
  });
});
