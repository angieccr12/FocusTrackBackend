//appRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware'); 

// Ruta para registrar una nueva aplicación (requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
  const { appName } = req.body;

  if (!appName) {
    return res.status(400).json({ error: 'El nombre de la aplicación es requerido' });
  }

  try {
    // Validar si la aplicación ya existe
    const duplicateCheck = await pool.query(
      'SELECT * FROM "App" WHERE LOWER("appName") = LOWER($1)',
      [appName]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'La aplicación ya está registrada' });
    }

    // Insertar la nueva aplicación
    const result = await pool.query(
      'INSERT INTO "App" ("appName") VALUES ($1) RETURNING *',
      [appName]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registrando aplicación:', error);
    res.status(500).json({ error: 'Error al registrar la aplicación' });
  }
});

// Ruta para obtener todas las aplicaciones registradas (requiere autenticación)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "App"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener apps:', error);
    res.status(500).json({ error: 'Error del servidor al obtener apps' });
  }
});

module.exports = router;
