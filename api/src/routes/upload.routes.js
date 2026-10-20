const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  uploadImage,
  uploadDocument,
  uploadGeneral
} = require('../middlewares/upload.middleware');

const {
  uploadSingleImage,
  uploadSingleDocument,
  uploadMultipleFiles,
  getAllFiles,
  deleteFile
} = require('../controllers/upload.controller');

// Middleware para atrapar errores específicos de Multer por ruta
const handleMulterError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('[Multer Error]', err);
        let mensaje = 'Error al subir archivo';
        if (err.code === 'LIMIT_FILE_SIZE') {
          mensaje = 'El archivo supera el tamaño máximo permitido';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          mensaje = `Campo de formulario no esperado: ${err.field}. Asegúrate de usar el nombre correcto.`;
        }
        return res.status(400).json({
          success: false,
          errorType: 'MulterError',
          code: err.code,
          message: mensaje
        });
      } else if (err) {
        // Errores lanzados por el fileFilter
        console.error('[Upload Filter Error]', err.message);
        return res.status(400).json({
          success: false,
          errorType: 'ValidationError',
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * RUTAS DE SUBIDA
 */

// 1. Subir una sola foto / imagen (campo 'image')
router.post(
  '/upload/image',
  handleMulterError(uploadImage.single('image')),
  uploadSingleImage
);

// 2. Subir un solo documento (PDF, Excel, Word, etc.) (campo 'document')
router.post(
  '/upload/document',
  handleMulterError(uploadDocument.single('document')),
  uploadSingleDocument
);

// 3. Subir múltiples archivos (imágenes o documentos) (campo 'files', máx 10)
router.post(
  '/upload/multiple',
  handleMulterError(uploadGeneral.array('files', 10)),
  uploadMultipleFiles
);

/**
 * RUTAS DE CONSULTA Y GESTIÓN
 */

// 4. Listar todos los archivos subidos al servidor
router.get('/files', getAllFiles);

// 5. Eliminar un archivo físico por categoría y nombre
router.delete('/files/:category/:filename', deleteFile);

module.exports = router;
