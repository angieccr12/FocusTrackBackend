// __tests__/reportRoutes.test.js

// ✅ Mockear antes de importar app
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 42 };
  next();
});

jest.mock('../../db', () => ({
  query: jest.fn()
}));

const request = require('supertest');
const app = require('../../app');
const pool = require('../../db');

describe('GET /api/report/:view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar estadísticas de app-time correctamente', async () => {
    const mockRows = [
      { label: 'YouTube', value: '3.5' },
      { label: 'Slack', value: '1.2' }
    ];

    pool.query.mockResolvedValue({ rows: mockRows });

    const res = await request(app).get('/api/report/app-time');
    expect(res.statusCode).toBe(200);
    expect(res.body.daily).toBeDefined();
    expect(res.body.weekly).toBeDefined();
    expect(res.body.barDaily.datasets[0].label).toBe('Hours Used (Daily)');
  });

  it('debería retornar estadísticas de device-time correctamente', async () => {
    const mockRows = [
      { label: 'Phone', value: '4.0' },
      { label: 'Laptop', value: '2.0' }
    ];

    pool.query.mockResolvedValue({ rows: mockRows });

    const res = await request(app).get('/api/report/device-time');
    expect(res.statusCode).toBe(200);
    expect(res.body.daily.labels).toContain('Phone');
    expect(res.body.barWeekly.datasets[0].label).toBe('Hours Used (Weekly)');
  });

  it('debería retornar estadísticas de device-app correctamente', async () => {
    const mockRows = [
      { deviceName: 'Phone', appName: 'YouTube', total_hours: '2.0' },
      { deviceName: 'Laptop', appName: 'Slack', total_hours: '1.0' }
    ];

    pool.query.mockResolvedValue({ rows: mockRows });

    const res = await request(app).get('/api/report/device-app');
    expect(res.statusCode).toBe(200);
    expect(res.body.daily.labels).toContain('Phone');
    expect(res.body.weekly.datasets.length).toBeGreaterThan(0);
  });

  it('debería retornar error si el view no es válido', async () => {
    const res = await request(app).get('/api/report/invalid-view');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid view type');
  });

  it('debería manejar errores del servidor', async () => {
    pool.query.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get('/api/report/app-time');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch statistics data');
  });
});
