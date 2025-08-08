const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

// Self-ping para mantener Railway activo
setTimeout(() => {
  const url = `http://127.0.0.1:${PORT}`;
  http.get(url, (res) => {
    console.log(`🔁 Self-ping responded with status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`❌ Self-ping error: ${e.message}`);
  });
}, 5000);
