const fs = require('fs');
const path = require('path');
const { IMAGES_DIR, DOCUMENTS_DIR } = require('../middlewares/upload.middleware');

// Función auxiliar para formatear tamaño de bytes a formato legible
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Construye objeto con información del archivo
const buildFileInfo = (req, file, category) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${category}/${file.filename}`;

  return {
    filename: file.filename,
    originalName: file.originalname,
    category: category,
    mimetype: file.mimetype,
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    url: fileUrl,
    uploadedAt: new Date().toISOString()
  };
};

/**
 * Controlador para subir una sola imagen
 */
const uploadSingleImage = (req, res) => {
  console.log('[Upload Controller] uploadSingleImage llamado');
  console.log('req.file recibido:', req.file);
  console.log('req.body recibido:', req.body);

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se ha proporcionado ninguna imagen en el campo "image"'
    });
  }

  const fileInfo = buildFileInfo(req, req.file, 'images');

  return res.status(201).json({
    success: true,
    message: 'Imagen subida exitosamente con Multer',
    file: fileInfo,
    extraData: req.body // Permite enviar campos adicionales como título o descripción
  });
};

/**
 * Controlador para subir un solo documento (PDF, Excel, etc.)
 */
const uploadSingleDocument = (req, res) => {
  console.log('[Upload Controller] uploadSingleDocument llamado');
  console.log('req.file recibido:', req.file);
  console.log('req.body recibido:', req.body);

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se ha proporcionado ningún documento en el campo "document"'
    });
  }

  const fileInfo = buildFileInfo(req, req.file, 'documents');

  return res.status(201).json({
    success: true,
    message: 'Documento subido exitosamente con Multer',
    file: fileInfo,
    extraData: req.body
  });
};

/**
 * Controlador para subir múltiples archivos
 */
const uploadMultipleFiles = (req, res) => {
  console.log('[Upload Controller] uploadMultipleFiles llamado');
  console.log('req.files recibidos:', req.files);
  console.log('req.body recibido:', req.body);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No se enviaron archivos en el campo "files"'
    });
  }

  const filesInfo = req.files.map((file) => {
    const category = file.mimetype.startsWith('image/') ? 'images' : 'documents';
    return buildFileInfo(req, file, category);
  });

  return res.status(201).json({
    success: true,
    message: `Se subieron ${req.files.length} archivos exitosamente`,
    total: req.files.length,
    files: filesInfo,
    extraData: req.body
  });
};

/**
 * Controlador para listar todos los archivos subidos actualmente
 */
const getAllFiles = async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get('host');

    const readCategoryDir = (dirPath, category) => {
      if (!fs.existsSync(dirPath)) return [];
      const filenames = fs.readdirSync(dirPath);
      
      return filenames
        .filter((name) => !name.startsWith('.'))
        .map((filename) => {
          const fullPath = path.join(dirPath, filename);
          const stats = fs.statSync(fullPath);
          return {
            filename,
            category,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            url: `${protocol}://${host}/uploads/${category}/${filename}`,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        });
    };

    const images = readCategoryDir(IMAGES_DIR, 'images');
    const documents = readCategoryDir(DOCUMENTS_DIR, 'documents');

    // Ordenar de más reciente a más antiguo
    const all = [...images, ...documents].sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

    console.log(`[Upload Controller] getAllFiles: ${images.length} imágenes, ${documents.length} documentos`);

    return res.status(200).json({
      success: true,
      count: all.length,
      images,
      documents,
      all
    });
  } catch (error) {
    console.error('[Upload Controller] Error al listar archivos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de archivos',
      error: error.message
    });
  }
};

/**
 * Controlador para eliminar un archivo existente
 */
const deleteFile = (req, res) => {
  const { category, filename } = req.params;
  console.log(`[Upload Controller] Petición de eliminación: categoría=${category}, archivo=${filename}`);

  if (!['images', 'documents'].includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Categoría no válida. Debe ser "images" o "documents"'
    });
  }

  // Prevenir Directory Traversal
  const safeFilename = path.basename(filename);
  const targetDir = category === 'images' ? IMAGES_DIR : DOCUMENTS_DIR;
  const targetPath = path.join(targetDir, safeFilename);

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({
      success: false,
      message: 'El archivo solicitado no existe en el servidor'
    });
  }

  try {
    fs.unlinkSync(targetPath);
    console.log(`[Upload Controller] Archivo eliminado: ${targetPath}`);
    return res.status(200).json({
      success: true,
      message: `Archivo "${safeFilename}" eliminado correctamente`,
      filename: safeFilename
    });
  } catch (error) {
    console.error('[Upload Controller] Error al eliminar archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al intentar eliminar el archivo del servidor',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadSingleDocument,
  uploadMultipleFiles,
  getAllFiles,
  deleteFile
};
