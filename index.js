// index.js
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

const http = require('http');

setTimeout(() => {
  const url = `http://localhost:${PORT}`;
  http.get(url, (res) => {
    console.log(`🔁 Self-ping responded with status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`❌ Self-ping error: ${e.message}`);
  });
}, 5000); // espera 5 segundos antes de hacer la petición