const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);

  // Mantener vivo el servidor en Railway
  const url = `http://localhost:${PORT}/health`;
  setInterval(() => {
    http.get(url, (res) => {
      console.log(`♻️ Keep-alive ping → ${url} [${res.statusCode}]`);
    }).on('error', (err) => {
      console.error('❌ Error en keep-alive:', err.message);
    });
  }, 5 * 60 * 1000); // cada 5 minutos
});