const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/upload.routes');
const { UPLOADS_DIR } = require('./middlewares/upload.middleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta 'uploads' como archivos estáticos
// Esto permite que el frontend acceda directamente a http://localhost:3000/uploads/images/... o /documents/...
app.use('/uploads', express.static(UPLOADS_DIR));

// Logger simple para ver solicitudes entrantes en consola
app.use((req, res, next) => {
  console.log(`[HTTP ${req.method}] ${req.url}`);
  next();
});

// Ruta de estado / bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API con Multer activa y funcionando',
    endpoints: {
      uploadImage: 'POST /api/upload/image (campo: image)',
      uploadDocument: 'POST /api/upload/document (campo: document)',
      uploadMultiple: 'POST /api/upload/multiple (campo: files)',
      listFiles: 'GET /api/files',
      deleteFile: 'DELETE /api/files/:category/:filename'
    }
  });
});

// Rutas principales de la API
app.use('/api', uploadRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  console.warn(`[404 Not Found] ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Manejador global de errores inesperados
app.use((err, req, res, next) => {
  console.error('[Error General del Servidor]:', err);
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error inesperado en el servidor',
    error: err.message
  });
});

module.exports = app;
