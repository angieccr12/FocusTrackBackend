const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/history - Obtener historial de actividades del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT 
        ar."recordId",
        ar."recordDate",
        ar."startTime",
        ar."endTime",
        a."appName",
        d."deviceName"
      FROM "ActivityRecord" ar
      INNER JOIN "App" a ON ar."appId" = a."appId"
      INNER JOIN "Device" d ON ar."deviceId" = d."deviceId"
      WHERE d."userId" = $1
      ORDER BY ar."recordDate" DESC, ar."startTime" DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    res.status(500).json({ error: 'Error al obtener historial de actividades' });
  }
});

module.exports = router;
