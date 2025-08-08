//deviceRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Registrar un nuevo dispositivo
router.post(
  '/',
  authenticateToken,
  [
    body('deviceName').notEmpty().withMessage('Device name is required'),
    body('deviceType').notEmpty().withMessage('Device type is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { deviceName, deviceType } = req.body;
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `INSERT INTO "Device" ("userId", "deviceType", "deviceName")
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, deviceType, deviceName]
      );

      res.status(201).json({
        message: 'Device registered successfully',
        device: result.rows[0]
      });
    } catch (err) {
      console.error('Error registering device:', err);
      res.status(500).json({ message: 'Internal server error while registering device' });
    }
  }
);

// Obtener todos los dispositivos del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM "Device"
       WHERE "userId" = $1
       ORDER BY "deviceName" ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving devices:', err);
    res.status(500).json({ message: 'Internal server error while retrieving devices' });
  }
});

module.exports = router;
