// __tests__/authRoutes.test.js

// ✅ Mockear primero
jest.mock('../../db', () => ({ query: jest.fn() }));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// 👇 Luego importar lo demás
const request = require('supertest');
const app = require('../../app'); // Usa app completo
const pool = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería rechazar si hay campos inválidos', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('debería rechazar si el email ya está registrado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ userId: 1 }] });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      first_name: 'John',
      last_name: 'Doe'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  it('debería registrar usuario exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // Email no registrado
      .mockResolvedValueOnce({
        rows: [{
          userId: 1,
          userEmail: 'test@example.com',
          userFirstName: 'John',
          userLastName: 'Doe'
        }]
      });

    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    jwt.sign.mockReturnValue('mockedToken');

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      first_name: 'John',
      last_name: 'Doe'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('token', 'mockedToken');
  });

  it('debería manejar errores del servidor (register)', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      first_name: 'John',
      last_name: 'Doe'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería rechazar si hay campos inválidos', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('debería rechazar si el usuario no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/auth/login').send({
      email: 'notfound@example.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('debería rechazar si la contraseña es incorrecta', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ userId: 1, userEmail: 'test@example.com', userPassword: 'hashed' }]
    });

    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpass'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('debería iniciar sesión correctamente', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashed',
        userFirstName: 'John',
        userLastName: 'Doe'
      }]
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('token', 'mockedToken');
  });

  it('debería manejar errores del servidor (login)', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});
