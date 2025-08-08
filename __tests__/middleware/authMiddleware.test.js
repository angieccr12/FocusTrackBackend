// __tests__/middleware/authMiddleware.test.js
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/authMiddleware');

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('debería responder 401 si no se proporciona token', () => {
    req.headers['authorization'] = undefined;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería responder 403 si el token es inválido', () => {
    req.headers['authorization'] = 'Bearer tokenInvalido';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería pasar al siguiente middleware si el token es válido', () => {
    req.headers['authorization'] = 'Bearer tokenValido';
    const fakeUser = { userId: 123 };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, fakeUser);
    });

    authenticateToken(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});
