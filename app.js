// app.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();

// // Middleware
// app.use(express.json());

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));

// // Rutas
// const pool = require('./db');
// const activityRoutes = require('./routes/activityRoutes.js');
// const historyRoutes = require('./routes/historial');
// const reportRoutes = require('./routes/reportRoutes'); 
// const authRoutes = require('./routes/authRoutes');
// const deviceRoutes = require('./routes/deviceRoutes');
// const appRoutes = require('./routes/appRoutes');

// app.use('/api/activity', activityRoutes);
// app.use('/api/history', historyRoutes);
// app.use('/api/report', reportRoutes); 
// app.use('/api/auth', authRoutes);
// app.use('/api/devices', deviceRoutes);
// app.use('/api/apps', appRoutes);

// // Rutas adicionales
// app.post('/api/test-post', (req, res) => {
//   res.json({ msg: 'Basic POST route works' });
// });

// app.get('/', (req, res) => {
//   res.send('FocusTrack Backend is running!');
// });

// app.get('/test-db', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Database connection error:', err);
//     res.status(500).send('Failed to connect to the database');
//   }
// });

// module.exports = app;


const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.type('text/plain').send('ok');
});

app.get('/health', (req, res) => {
  res.send('ok');
});

module.exports = app;