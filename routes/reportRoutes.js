//reportRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Helper para formatear datos para Chart.js
function formatForChartJS(rows, labelField, valueField, colors) {
  const labels = rows.map(row => row[labelField]);
  const data = rows.map(row => row[valueField]);
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 1
    }]
  };
}

// Ruta unificada para retornar datos formateados para estadística
router.get('/:view', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { view } = req.params;
  const colors = ['#213448', '#547792', '#94B4C1', '#a87f57', '#4A4947', '#e2e2e2'];

  try {
    if (view === 'app-time') {
      const fetchData = async (days) => {
        const result = await pool.query(`
          SELECT a."appName" AS label,
                SUM(EXTRACT(EPOCH FROM (ar."endTime" - ar."startTime")) / 3600)::NUMERIC(5,2) AS value
          FROM "ActivityRecord" ar
          JOIN "App" a ON ar."appId" = a."appId"
          JOIN "Device" d ON ar."deviceId" = d."deviceId"
          WHERE d."userId" = $1 AND ar."recordDate" >= CURRENT_DATE - ($2 || ' days')::interval
          GROUP BY a."appName"
          ORDER BY value DESC
        `, [userId, days]);
        return formatForChartJS(result.rows, 'label', 'value', colors);
      };

      const daily = await fetchData(1);
      const weekly = await fetchData(7);

      const barDaily = { ...daily, datasets: [{ ...daily.datasets[0], label: 'Hours Used (Daily)' }] };
      const barWeekly = { ...weekly, datasets: [{ ...weekly.datasets[0], label: 'Hours Used (Weekly)' }] };

      return res.json({ daily, weekly, barDaily, barWeekly });
    }

    if (view === 'device-time') {
      const fetchData = async (days) => {
        const result = await pool.query(`
          SELECT d."deviceName" AS label,
                SUM(EXTRACT(EPOCH FROM (ar."endTime" - ar."startTime")) / 3600)::NUMERIC(5,2) AS value
          FROM "ActivityRecord" ar
          JOIN "Device" d ON ar."deviceId" = d."deviceId"
          WHERE d."userId" = $1 AND ar."recordDate" >= CURRENT_DATE - ($2 || ' days')::interval
          GROUP BY d."deviceName"
          ORDER BY value DESC
        `, [userId, days]);
        return formatForChartJS(result.rows, 'label', 'value', colors);
      };

      const daily = await fetchData(1);
      const weekly = await fetchData(7);

      const barDaily = { ...daily, datasets: [{ ...daily.datasets[0], label: 'Hours Used (Daily)' }] };
      const barWeekly = { ...weekly, datasets: [{ ...weekly.datasets[0], label: 'Hours Used (Weekly)' }] };

      return res.json({ daily, weekly, barDaily, barWeekly });
    }

    if (view === 'device-app') {
      const fetchData = async (days) => {
        const result = await pool.query(`
          SELECT d."deviceName", a."appName",
                SUM(EXTRACT(EPOCH FROM (ar."endTime" - ar."startTime")) / 3600)::NUMERIC(5,2) AS total_hours
          FROM "ActivityRecord" ar
          JOIN "App" a ON ar."appId" = a."appId"
          JOIN "Device" d ON ar."deviceId" = d."deviceId"
          WHERE d."userId" = $1 AND ar."recordDate" >= CURRENT_DATE - ($2 || ' days')::interval
          GROUP BY d."deviceName", a."appName"
          ORDER BY d."deviceName"
        `, [userId, days]);

        const devices = [...new Set(result.rows.map(row => row.deviceName))];
        const apps = [...new Set(result.rows.map(row => row.appName))];

        const datasets = apps.map((app, i) => {
          const data = devices.map(device => {
            const match = result.rows.find(row => row.deviceName === device && row.appName === app);
            return match ? parseFloat(match.total_hours) : 0;
          });
          return {
            label: app,
            data,
            backgroundColor: colors[i % colors.length],
          };
        });

        return {
          labels: devices,
          datasets,
        };
      };

      const daily = await fetchData(1);
      const weekly = await fetchData(7);

      return res.json({ daily, weekly });
    }

    return res.status(400).json({ error: 'Invalid view type' });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics data' });
  }
});

module.exports = router;