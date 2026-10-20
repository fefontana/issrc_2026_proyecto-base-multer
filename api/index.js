require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
  console.log(`📁 Carpeta de uploads expuesta en http://localhost:${PORT}/uploads`);
  console.log(`📡 Rutas disponibles bajo http://localhost:${PORT}/api`);
  console.log('====================================================');
});
