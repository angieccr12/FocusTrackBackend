//activityRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Ruta para registrar una nueva actividad (y registrar la app si no existe)
router.post(
  '/',
  authenticateToken,
  [
    body('deviceId').isInt().withMessage('deviceId must be an integer'),
    body('appName').notEmpty().withMessage('appName is required'),
    body('recordDate').isISO8601().withMessage('recordDate must be in format YYYY-MM-DD'),
    body('startTime')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('startTime must be in HH:mm format'),
    body('endTime')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('endTime must be in HH:mm format'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, appName, recordDate, startTime, endTime } = req.body;

    try {
      // Verificar si la app ya existe (sin userId porque App no tiene esa columna)
      let appResult = await pool.query(
        'SELECT "appId" FROM "App" WHERE LOWER("appName") = LOWER($1)',
        [appName]
      );

      let appId;
      if (appResult.rows.length > 0) {
        appId = appResult.rows[0].appId;
      } else {
        // Insertar nueva app
        const insertApp = await pool.query(
          'INSERT INTO "App" ("appName") VALUES ($1) RETURNING "appId"',
          [appName]
        );
        appId = insertApp.rows[0].appId;
      }

      // Registrar la actividad
      const activityResult = await pool.query(
        `
        INSERT INTO "ActivityRecord" ("appId", "deviceId", "recordDate", "startTime", "endTime")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [appId, deviceId, recordDate, startTime, endTime]
      );

      res.status(201).json(activityResult.rows[0]);
    } catch (error) {
      console.error('Error registering activity:', error);
      res.status(500).json({ error: 'Error registering activity' });
    }
  }
);

module.exports = router;
