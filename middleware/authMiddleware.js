const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth Header:', req.headers['authorization']);
  console.log('Token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.user = user; // Aquí se guarda el userId para que lo uses luego
    console.log('🔐 Token decodificado (req.user):', user);
    next();
  });
}

module.exports = authenticateToken;